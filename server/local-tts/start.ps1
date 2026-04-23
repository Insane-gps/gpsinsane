$ErrorActionPreference = "Stop"

Set-Location $PSScriptRoot

function Get-PythonLauncherVersion {
  param([string]$Version)
  $hasNativePreference = $null -ne (Get-Variable -Name PSNativeCommandUseErrorActionPreference -ErrorAction SilentlyContinue)
  if ($hasNativePreference) {
    $oldPreference = $PSNativeCommandUseErrorActionPreference
    $PSNativeCommandUseErrorActionPreference = $false
  }

  try {
    & py -$Version -c "import sys; print(sys.version)" 2>$null | Out-Null
    return ($LASTEXITCODE -eq 0)
  } catch {
    return $false
  } finally {
    if ($hasNativePreference) {
      $PSNativeCommandUseErrorActionPreference = $oldPreference
    }
  }
}

$pyVersion = $null
if (Get-PythonLauncherVersion -Version "3.10") {
  $pyVersion = "3.10"
} elseif (Get-PythonLauncherVersion -Version "3.11") {
  $pyVersion = "3.11"
} else {
  Write-Host "[local-tts] Python 3.10/3.11 não encontrado via launcher 'py'." -ForegroundColor Red
  Write-Host "[local-tts] Instale Python 3.10 (recomendado): winget install Python.Python.3.10" -ForegroundColor Yellow
  Write-Host "[local-tts] Depois rode novamente este script." -ForegroundColor Yellow
  exit 1
}

if (!(Test-Path ".venv")) {
  Write-Host "[local-tts] Criando venv..."
  py -$pyVersion -m venv .venv

  if ($LASTEXITCODE -ne 0) {
    Write-Host "[local-tts] Falha ao criar .venv com Python $pyVersion." -ForegroundColor Red
    Write-Host "[local-tts] Verifique a instalação do Python e tente novamente." -ForegroundColor Yellow
    exit 1
  }
}

if (!(Test-Path ".venv\Scripts\Activate.ps1")) {
  Write-Host "[local-tts] .venv criado sem script de ativação esperado." -ForegroundColor Red
  Write-Host "[local-tts] Apague a pasta .venv e rode novamente após instalar Python 3.10/3.11." -ForegroundColor Yellow
  exit 1
}

Write-Host "[local-tts] Ativando venv..."
. .\.venv\Scripts\Activate.ps1

Write-Host "[local-tts] Instalando dependências..."
pip install --upgrade pip
pip install -r requirements.txt

Write-Host "[local-tts] Iniciando em http://127.0.0.1:8020 ..."
python -m uvicorn app:app --host 127.0.0.1 --port 8020
