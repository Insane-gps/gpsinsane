# Voz local (sem ElevenLabs) — preparo

Status atual:
- O servidor está em modo duplo por variável de ambiente.
- Providers disponíveis: `eleven`, `local`, `auto`.
- Modo `auto`: tenta local primeiro (quando `LOCAL_VOICE_SAMPLE` está definido) e cai para Eleven se falhar.

## 1) Quando você tiver sua voz
Você vai precisar de uma amostra limpa da sua voz (`.wav`, 16kHz/22kHz, sem ruído):
- ideal: 30 segundos a 2 minutos
- sem música de fundo
- fala natural

## 2) Rodar um TTS local com clonagem de voz
Sugestão prática: Coqui XTTS-v2 (local ou VPS própria).

## 3) Configuração via .env (sem mexer no código)
No `server/.env`:

```env
VOICE_PROVIDER=eleven
VOICE_FALLBACK=1

ELEVEN_API_KEY=...
ELEVEN_VOICE_ID=...

LOCAL_TTS_URL=http://127.0.0.1:8020/tts
LOCAL_VOICE_SAMPLE=C:\\vozes\\minha-voz.wav
LOCAL_LANGUAGE=pt
```

Troca rápida de modos:
- `VOICE_PROVIDER=eleven` -> usa Eleven
- `VOICE_PROVIDER=local` -> usa local
- `VOICE_PROVIDER=auto` -> local preferencial + fallback

## 4) Rodar servidor
No terminal do `server/`:

Windows PowerShell:

```powershell
node index.js
```

## 5) Contrato do endpoint local
O servidor envia para o `LOCAL_TTS_URL` este JSON:

```json
{
	"text": "texto para falar",
	"speaker_wav": "C:\\\\vozes\\\\minha-voz.wav",
	"language": "pt"
}
```

Respostas aceitas:
- `application/json` com `audioBase64` (ou `audio`/`base64`), ou
- binário de áudio (`audio/wav`, `audio/mpeg`, etc.).

Você pode validar configuração em:
- `GET /voice-config`

## 6) Fluxo esperado
`app` -> `POST /speak` (texto) -> `server` -> `TTS local com sua voz` -> áudio base64 -> `app`.

---
Se quiser, no próximo passo eu monto um `docker-compose` de XTTS-v2 já com endpoint `/tts` compatível com esse contrato.
