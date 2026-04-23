# Local TTS (XTTS-v2) para Windows

Serviço local compatível com seu server atual.

- Host: `127.0.0.1`
- Porta: `8020`
- Endpoint: `POST /tts`
- Modelo: `tts_models/multilingual/multi-dataset/xtts_v2`

## Requisitos

- Windows 10/11
- Python 3.10 ou 3.11 (3.10 recomendado)
- PowerShell

Se você só tiver Python 3.14, instale 3.10 com:

```powershell
winget install Python.Python.3.10
```

## 1) Caminho da amostra de voz

Este serviço já está preparado para usar:

`C:\Users\user\gpsclean\server\voice-sample\gravacoes\minha-voz.wav`

## 2) Instalação + inicialização

No PowerShell:

```powershell
cd C:\Users\user\gpsclean\server\local-tts
.\start.ps1
```

Observações:
- Na primeira execução, o script cria `.venv`, instala dependências e pode demorar para baixar o modelo.
- Depois, o serviço sobe em `http://127.0.0.1:8020`.

## 3) Teste rápido no PowerShell

Com o serviço rodando em outro terminal:

```powershell
cd C:\Users\user\gpsclean\server\local-tts
.\test.ps1
```

Se der certo, será criado:

`C:\Users\user\gpsclean\server\local-tts\teste_saida.wav`

## 4) Teste manual do endpoint `/tts`

Payload aceito:

```json
{
  "text": "texto para falar",
  "speaker_wav": "C:\\Users\\user\\gpsclean\\server\\voice-sample\\gravacoes\\minha-voz.wav",
  "language": "pt"
}
```

Resposta:

```json
{
  "audioBase64": "...",
  "mime": "audio/wav",
  "provider": "xtts_v2_local"
}
```

## 5) Health check

```powershell
Invoke-RestMethod http://127.0.0.1:8020/health
```

## 6) Compatibilidade com seu server atual

Seu `server/index.js` já está compatível com esse retorno (`audioBase64`).
