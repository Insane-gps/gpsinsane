const { spawnSync } = require("child_process");
const path = require("path");

const SERVER_DIR = path.resolve(__dirname, "..");
const LOCAL_TTS_DIR = path.resolve(SERVER_DIR, "local-tts");
const VENV_DIR = path.resolve(LOCAL_TTS_DIR, ".venv");
const REQUIREMENTS = path.resolve(LOCAL_TTS_DIR, "requirements.txt");

// On Linux the venv pip/python are under bin/, on Windows under Scripts/
const IS_WIN = process.platform === "win32";
const VENV_BIN = path.join(VENV_DIR, IS_WIN ? "Scripts" : "bin");
const VENV_PYTHON = path.join(VENV_BIN, IS_WIN ? "python.exe" : "python");
const VENV_PIP = path.join(VENV_BIN, IS_WIN ? "pip.exe" : "pip");

function run(cmd, args, cwd = LOCAL_TTS_DIR) {
  const result = spawnSync(cmd, args, {
    cwd,
    env: process.env,
    stdio: "inherit",
    shell: false,
  });
  return result;
}

function isRender() {
  return String(process.env.RENDER || "").toLowerCase() === "true";
}

if (!isRender()) {
  process.exit(0);
}

// Find a usable system Python to create the venv
const candidates = ["python3", "python"];
let systemPython = null;
for (const cmd of candidates) {
  const probe = spawnSync(cmd, ["--version"], { stdio: "ignore" });
  if (probe.status === 0) {
    systemPython = cmd;
    break;
  }
}

if (!systemPython) {
  console.error("[render-postinstall] Python não encontrado no sistema.");
  process.exit(1);
}

// Create virtual environment
console.log("[render-postinstall] PY VENV CREATING");
const venvResult = run(systemPython, ["-m", "venv", VENV_DIR], LOCAL_TTS_DIR);
if (venvResult.status !== 0) {
  console.error("[render-postinstall] Falha ao criar venv.");
  process.exit(venvResult.status || 1);
}
console.log("[render-postinstall] PY VENV READY");

// Upgrade pip inside the venv
run(VENV_PYTHON, ["-m", "pip", "install", "--upgrade", "pip"]);

// Install PyTorch CPU-only wheel BEFORE requirements.txt so pip does not
// resolve a CUDA/NVIDIA build when processing the rest of the deps.
console.log("[render-postinstall] PY TORCH CPU INSTALLING");
const torchInstall = run(VENV_PYTHON, [
  "-m", "pip", "install",
  "--index-url", "https://download.pytorch.org/whl/cpu",
  "torch==2.2.0",
]);
if (torchInstall.status !== 0) {
  console.error("[render-postinstall] Falha ao instalar PyTorch CPU.");
  process.exit(torchInstall.status || 1);
}
console.log("[render-postinstall] PY TORCH CPU READY");

console.log("[render-postinstall] PY TORCHAUDIO CPU INSTALLING");
const torchaudioInstall = run(VENV_PYTHON, [
  "-m", "pip", "install",
  "--index-url", "https://download.pytorch.org/whl/cpu",
  "torchaudio==2.2.0",
]);
if (torchaudioInstall.status !== 0) {
  console.error("[render-postinstall] Falha ao instalar torchaudio CPU.");
  process.exit(torchaudioInstall.status || 1);
}
console.log("[render-postinstall] PY TORCHAUDIO CPU READY");

// Install requirements using the venv pip
console.log("[render-postinstall] PY REQS INSTALLING");
const install = run(VENV_PYTHON, ["-m", "pip", "install", "-r", REQUIREMENTS]);
if (install.status !== 0) {
  console.error("[render-postinstall] Falha ao instalar dependências Python do local-tts.");
  process.exit(install.status || 1);
}

console.log("[render-postinstall] PY REQS READY");
