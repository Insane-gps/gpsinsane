const { spawnSync } = require("child_process");
const path = require("path");

const SERVER_DIR = path.resolve(__dirname, "..");
const REQUIREMENTS = path.resolve(SERVER_DIR, "local-tts", "requirements.txt");

function run(cmd, args, cwd = SERVER_DIR) {
  return spawnSync(cmd, args, {
    cwd,
    env: process.env,
    stdio: "inherit",
    shell: false,
  });
}

function isRender() {
  return String(process.env.RENDER || "").toLowerCase() === "true";
}

if (!isRender()) {
  process.exit(0);
}

const candidates = [
  ["python3", ["-m", "pip", "install", "--upgrade", "pip"]],
  ["python", ["-m", "pip", "install", "--upgrade", "pip"]],
];

let pythonCmd = null;

for (const [cmd, args] of candidates) {
  const probe = spawnSync(cmd, ["--version"], { stdio: "ignore" });
  if (probe.status === 0) {
    pythonCmd = cmd;
    run(cmd, args);
    break;
  }
}

if (!pythonCmd) {
  console.error("[render-postinstall] Python não encontrado para instalar dependências do local-tts.");
  process.exit(1);
}

const install = run(pythonCmd, ["-m", "pip", "install", "-r", REQUIREMENTS]);
if (install.status !== 0) {
  console.error("[render-postinstall] Falha ao instalar dependências Python do local-tts.");
  process.exit(install.status || 1);
}

console.log("[render-postinstall] Dependências Python do local-tts instaladas com sucesso.");
