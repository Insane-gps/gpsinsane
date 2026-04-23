import base64
import io
import os
import time
import wave
from pathlib import Path
from threading import Lock
from typing import Dict, Optional, Tuple

# Accept Coqui TTS license non-interactively (required for headless/CI environments).
# This must be set before the TTS library is imported so the prompt is never shown.
os.environ.setdefault("COQUI_TOS_AGREED", "1")

import numpy as np
import torch
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from TTS.api import TTS

# Mantem cache do modelo em pasta local/persistente para evitar redownload em runtime
_models_dir = Path(__file__).resolve().parent / ".models"
_models_dir.mkdir(parents=True, exist_ok=True)
os.environ.setdefault("TTS_HOME", str(_models_dir))

app = FastAPI(title="Local XTTS Service", version="2.0.0")

_model_lock = Lock()
_inference_lock = Lock()
_model: Optional[TTS] = None
_tts_model = None
_device = "cuda" if torch.cuda.is_available() else "cpu"
_default_language = os.getenv("LOCAL_TTS_LANGUAGE", "pt")
_use_stream = os.getenv("LOCAL_TTS_USE_STREAM", "1").strip().lower() in {"1", "true", "yes", "on"}

_speaker_latents_cache: Dict[str, Tuple[object, object]] = {}


class TTSRequest(BaseModel):
    text: str
    speaker_wav: Optional[str] = None
    language: Optional[str] = None
    speed: Optional[float] = None


class TTSResponse(BaseModel):
    audioBase64: str
    mime: str = "audio/wav"
    provider: str = "xtts_v2_local"


def _resolve_default_speaker() -> Optional[str]:
    configured = os.getenv("LOCAL_VOICE_SAMPLE", "").strip()
    if configured:
        return configured

    repo_default = Path(__file__).resolve().parents[1] / "voice-sample" / "gravacoes" / "minha-voz.wav"
    if repo_default.exists():
        return str(repo_default)
    return None


def _sample_rate() -> int:
    try:
        if _model is not None and getattr(_model, "synthesizer", None) is not None:
            value = getattr(_model.synthesizer, "output_sample_rate", None)
            if value:
                return int(value)
    except Exception:
        pass
    return 24000


def _wav_to_base64(wav_array: np.ndarray, sample_rate: int) -> str:
    audio = np.asarray(wav_array, dtype=np.float32).flatten()
    if audio.size == 0:
        raise ValueError("generated audio is empty")

    audio = np.clip(audio, -1.0, 1.0)
    pcm16 = (audio * 32767.0).astype(np.int16)

    with io.BytesIO() as buffer:
        with wave.open(buffer, "wb") as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2)
            wf.setframerate(int(sample_rate))
            wf.writeframes(pcm16.tobytes())
        return base64.b64encode(buffer.getvalue()).decode("utf-8")


def _load_model_once() -> None:
    global _model
    global _tts_model

    if _model is not None and _tts_model is not None:
        return

    with _model_lock:
        if _model is not None and _tts_model is not None:
            return

        print("XTTS STARTUP: loading model", flush=True)

        model = TTS(model_name="tts_models/multilingual/multi-dataset/xtts_v2")
        model.to(_device)

        tts_model = getattr(getattr(model, "synthesizer", None), "tts_model", None)
        if tts_model is None:
            raise RuntimeError("xtts_backend_not_available")

        _model = model
        _tts_model = tts_model


def _compute_latents_for_speaker(speaker_path: str):
    if _tts_model is None:
        raise RuntimeError("xtts_not_initialized")

    # Tenta formatos aceitos por diferentes versões do Coqui XTTS
    with torch.no_grad():
        try:
            latents = _tts_model.get_conditioning_latents(audio_path=[speaker_path])
        except TypeError:
            latents = _tts_model.get_conditioning_latents(audio_path=speaker_path)

    if isinstance(latents, tuple) and len(latents) >= 2:
        return latents[0], latents[1]

    raise RuntimeError("invalid_latents_response")


def _get_or_create_speaker_latents(speaker_path: str):
    cached = _speaker_latents_cache.get(speaker_path)
    if cached is not None:
        return cached

    with _model_lock:
        cached = _speaker_latents_cache.get(speaker_path)
        if cached is not None:
            return cached

        print("XTTS STARTUP: loading speaker latents", flush=True)
        gpt_cond_latent, speaker_embedding = _compute_latents_for_speaker(speaker_path)
        _speaker_latents_cache[speaker_path] = (gpt_cond_latent, speaker_embedding)
        return gpt_cond_latent, speaker_embedding


def _inference_wav(text: str, language: str, speed: float, gpt_cond_latent, speaker_embedding) -> np.ndarray:
    if _tts_model is None:
        raise RuntimeError("xtts_not_initialized")

    kwargs_base = {
        "text": text,
        "language": language,
        "gpt_cond_latent": gpt_cond_latent,
        "speaker_embedding": speaker_embedding,
        "enable_text_splitting": True,
    }

    if _use_stream and hasattr(_tts_model, "inference_stream"):
        chunks = []
        try:
            iterator = _tts_model.inference_stream(**{**kwargs_base, "speed": speed})
        except TypeError:
            iterator = _tts_model.inference_stream(**kwargs_base)
        for chunk in iterator:
            if isinstance(chunk, torch.Tensor):
                chunk = chunk.detach().cpu().float().numpy()
            chunk_np = np.asarray(chunk, dtype=np.float32).flatten()
            if chunk_np.size > 0:
                chunks.append(chunk_np)

        if chunks:
            return np.concatenate(chunks, axis=0)

    try:
        out = _tts_model.inference(**{**kwargs_base, "speed": speed})
    except TypeError:
        out = _tts_model.inference(**kwargs_base)
    wav = out.get("wav") if isinstance(out, dict) else out
    if isinstance(wav, torch.Tensor):
        wav = wav.detach().cpu().float().numpy()
    return np.asarray(wav, dtype=np.float32).flatten()


@app.on_event("startup")
def _startup_init() -> None:
    _load_model_once()

    default_speaker = _resolve_default_speaker()
    if default_speaker and Path(default_speaker).exists():
        _get_or_create_speaker_latents(default_speaker)
    else:
        print("XTTS STARTUP: loading speaker latents", flush=True)
        print("XTTS STARTUP: default speaker not found", flush=True)

    print("XTTS READY", flush=True)


@app.get("/")
def root() -> dict:
    return {
        "ok": True,
        "service": "local-tts",
        "model": "xtts_v2",
        "device": _device,
        "tts_home": str(_models_dir),
    }


@app.get("/health")
def health() -> dict:
    return {
        "ok": True,
        "device": _device,
        "defaultSpeaker": _resolve_default_speaker(),
        "latentsCached": len(_speaker_latents_cache),
        "streamEnabled": _use_stream,
    }


@app.post("/tts", response_model=TTSResponse)
def tts(req: TTSRequest) -> TTSResponse:
    request_started = time.perf_counter()
    print("XTTS REQUEST START", flush=True)

    text = (req.text or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="text is required")

    speaker = (req.speaker_wav or "").strip() or _resolve_default_speaker()
    if not speaker:
        raise HTTPException(status_code=400, detail="speaker_wav is required and no LOCAL_VOICE_SAMPLE/default was found")

    speaker_path = Path(speaker)
    if not speaker_path.exists():
        raise HTTPException(status_code=400, detail=f"speaker_wav not found: {speaker}")

    language = (req.language or "").strip() or _default_language
    tts_speed = float(req.speed) if req.speed is not None else 0.9
    tts_speed = max(0.5, min(tts_speed, 2.0))

    try:
        _load_model_once()
        gpt_cond_latent, speaker_embedding = _get_or_create_speaker_latents(str(speaker_path))

        with _inference_lock:
            wav = _inference_wav(
                text=text,
                language=language,
                speed=tts_speed,
                gpt_cond_latent=gpt_cond_latent,
                speaker_embedding=speaker_embedding,
            )

        audio_base64 = _wav_to_base64(wav, _sample_rate())
        duration_ms = int((time.perf_counter() - request_started) * 1000)
        print("XTTS REQUEST END", flush=True)
        print(f"XTTS REQUEST DURATION_MS: {duration_ms}", flush=True)
        return TTSResponse(audioBase64=audio_base64)

    except HTTPException:
        duration_ms = int((time.perf_counter() - request_started) * 1000)
        print(f"XTTS REQUEST DURATION_MS: {duration_ms}", flush=True)
        raise
    except Exception as exc:
        duration_ms = int((time.perf_counter() - request_started) * 1000)
        print(f"XTTS REQUEST DURATION_MS: {duration_ms}", flush=True)
        raise HTTPException(status_code=500, detail=f"tts_error: {exc}") from exc
