const { spawn } = require("child_process");
const path = require("path");

const SERVER_DIR = path.resolve(__dirname, "..");
const LOCAL_TTS_DIR = path.resolve(SERVER_DIR, "local-tts");
const LOCAL_TTS_URL = String(process.env.LOCAL_TTS_URL || "http://127.0.0.1:8020/tts").trim();
const LOCAL_TTS_BOOT_TIMEOUT_MS = Math.max(
  30000,
  Number(process.env.LOCAL_TTS_BOOT_TIMEOUT_MS || 300000) || 300000
);

// Prefer the venv Python so we use the isolated environment created by postinstall
const IS_WIN = process.platform === "win32";
const VENV_PYTHON = path.resolve(
  LOCAL_TTS_DIR,
  ".venv",
  IS_WIN ? "Scripts" : "bin",
  IS_WIN ? "python.exe" : "python"
);

const PYTHON_CANDIDATES = [
  String(process.env.PYTHON_BIN || "").trim(),
  VENV_PYTHON,
  "python3",
  "python",
].filter(Boolean);

let localTtsProcess = null;
let nodeProcess = null;
let shuttingDown = false;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function isLocalTtsReady() {
  try {
    const response = await fetch(LOCAL_TTS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    // /tts existe e respondeu (422/400 sem sintetizar ja indica pronto)
    return response.status === 400 || response.status === 422 || response.ok;
  } catch {
    return false;
  }
}

async function waitForLocalTtsReady() {
  const start = Date.now();
  while (Date.now() - start < LOCAL_TTS_BOOT_TIMEOUT_MS) {
    if (await isLocalTtsReady()) {
      console.log("LOCAL TTS READY");
      return;
    }
    await sleep(1500);
  }

  throw new Error(`LOCAL_TTS_BOOT_TIMEOUT after ${LOCAL_TTS_BOOT_TIMEOUT_MS}ms`);
}

function spawnLocalTtsWithPythonBin(pythonBin) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      pythonBin,
      ["-m", "uvicorn", "app:app", "--host", "127.0.0.1", "--port", "8020"],
      {
        cwd: LOCAL_TTS_DIR,
        env: { ...process.env, PYTHONUNBUFFERED: "1" },
        stdio: ["ignore", "pipe", "pipe"],
      }
    );

    let settled = false;

    const fail = (err) => {
      if (settled) return;
      settled = true;
      try {
        child.kill("SIGTERM");
      } catch {}
      reject(err);
    };

    child.once("error", (err) => fail(err));

    child.stdout.on("data", (chunk) => {
      process.stdout.write(`[local-tts] ${chunk.toString()}`);
    });

    child.stderr.on("data", (chunk) => {
      process.stderr.write(`[local-tts] ${chunk.toString()}`);
    });

    child.once("spawn", async () => {
      localTtsProcess = child;
      try {
        await waitForLocalTtsReady();
        if (settled) return;
        settled = true;
        resolve(child);
      } catch (err) {
        fail(err);
      }
    });

    child.once("exit", (code, signal) => {
      if (!settled) {
        fail(new Error(`local-tts exited early (code=${code}, signal=${signal})`));
      }
      if (!shuttingDown && code !== 0) {
        console.error(`local-tts exited (code=${code}, signal=${signal})`);
      }
    });
  });
}

async function startLocalTts() {
  console.log("LOCAL TTS STARTING");

  // ja estava pronto (ex.: processo externo)
  if (await isLocalTtsReady()) {
    console.log("LOCAL TTS READY");
    return;
  }

  let lastError = null;

  for (const pythonBin of PYTHON_CANDIDATES) {
    try {
      await spawnLocalTtsWithPythonBin(pythonBin);
      return;
    } catch (err) {
      lastError = err;
      console.error(`[local-tts] falha com ${pythonBin}:`, err?.message || err);
    }
  }

  throw lastError || new Error("Could not start local-tts");
}

function startVoiceServerNode() {
  console.log("VOICE SERVER STARTING");

  nodeProcess = spawn("node", ["index.js"], {
    cwd: SERVER_DIR,
    env: process.env,
    stdio: "inherit",
  });

  nodeProcess.once("exit", (code, signal) => {
    if (shuttingDown) return;

    shuttingDown = true;
    try {
      if (localTtsProcess && !localTtsProcess.killed) {
        localTtsProcess.kill("SIGTERM");
      }
    } catch {}

    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 0);
  });
}

function setupShutdownHooks() {
  const shutdown = () => {
    if (shuttingDown) return;
    shuttingDown = true;

    try {
      if (nodeProcess && !nodeProcess.killed) {
        nodeProcess.kill("SIGTERM");
      }
    } catch {}

    try {
      if (localTtsProcess && !localTtsProcess.killed) {
        localTtsProcess.kill("SIGTERM");
      }
    } catch {}

    setTimeout(() => process.exit(0), 1200);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

(async () => {
  setupShutdownHooks();
  await startLocalTts();
  startVoiceServerNode();
})().catch((err) => {
  console.error("start-unified failed:", err?.message || err);
  process.exit(1);
});
