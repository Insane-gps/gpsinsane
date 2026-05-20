# Voz XTTS (Contabo) — preparo

Status atual:
- O servidor usa apenas XTTS.
- O endpoint `/speak` chama somente o endpoint XTTS configurado.

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
XTTS_URL=http://127.0.0.1:8020/tts
XTTS_VOICE_SAMPLE=C:\\vozes\\minha-voz.wav
XTTS_LANGUAGE=pt
```

Compatibilidade legada:
- `LOCAL_TTS_URL`, `LOCAL_VOICE_SAMPLE` e `LOCAL_LANGUAGE` ainda funcionam como fallback de leitura.

## 4) Rodar servidor
No terminal do `server/`:

Windows PowerShell:

```powershell
node index.js
```

## 5) Contrato do endpoint XTTS
O servidor envia para o `XTTS_URL` este JSON:

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
