const { getDefaultConfig } = require("expo/metro-config");
const os = require("os");
const path = require("path");

// On Windows, force Metro's native recursive watcher and avoid fallback watcher overload.
// Use absolute paths into node_modules to bypass package exports restrictions.
if (os.platform() === "win32") {
  try {
    const nativeWatcherPath = path.join(
      __dirname,
      "node_modules",
      "metro-file-map",
      "src",
      "watchers",
      "NativeWatcher.js"
    );
    const fallbackWatcherPath = path.join(
      __dirname,
      "node_modules",
      "metro-file-map",
      "src",
      "watchers",
      "FallbackWatcher.js"
    );

    const NativeWatcherModule = require(nativeWatcherPath);
    NativeWatcherModule.default.isSupported = () => true;

    const originalHandleEvent = NativeWatcherModule.default.prototype._handleEvent;
    NativeWatcherModule.default.prototype._handleEvent = function patchedHandleEvent(relativePath) {
      if (Buffer.isBuffer(relativePath)) {
        relativePath = relativePath.toString();
      }
      if (typeof relativePath !== "string" || !relativePath.trim()) {
        return Promise.resolve();
      }

      // Ignore Android CMake/NDK temp artifacts that can throw EPERM on Windows.
      if (/(^|[\\/])\.cxx([\\/]|$)/i.test(relativePath)) {
        return Promise.resolve();
      }

      return originalHandleEvent.call(this, relativePath).catch((error) => {
        const code = String(error?.code || "").toUpperCase();
        if (code === "EPERM" || code === "ENOENT" || code === "EBUSY") {
          return;
        }
        throw error;
      });
    };

    const FallbackWatcherModule = require(fallbackWatcherPath);
    const originalWatchDir = FallbackWatcherModule.default.prototype._watchdir;
    FallbackWatcherModule.default.prototype._watchdir = function patchedWatchDir(dir) {
      if (String(dir).toLowerCase().includes("\\node_modules\\")) {
        return false;
      }
      return originalWatchDir.call(this, dir);
    };
  } catch (e) {
    console.warn("[metro-config] watcher patch not applied:", e?.message || e);
  }
}

const config = getDefaultConfig(__dirname);

config.useWatchman = false;
config.resolver = config.resolver || {};
config.resolver.blockList = [
  /[\\/]node_modules[\\/]expo-modules-core[\\/]android[\\/]\.cxx[\\/].*/,
];

module.exports = config;