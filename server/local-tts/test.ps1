$ErrorActionPreference = "Stop"

$body = @{
  text = "Teste de voz local com clonagem XTTS"
  speaker_wav = "C:\Users\user\gpsclean\server\voice-sample\gravacoes\minha-voz.wav"
  language = "pt"
} | ConvertTo-Json

$response = Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:8020/tts" -ContentType "application/json" -Body $body

[IO.File]::WriteAllBytes(
  "C:\Users\user\gpsclean\server\local-tts\teste_saida.wav",
  [Convert]::FromBase64String($response.audioBase64)
)

Write-Host "Arquivo gerado: C:\Users\user\gpsclean\server\local-tts\teste_saida.wav"
