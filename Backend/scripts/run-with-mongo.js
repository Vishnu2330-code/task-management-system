const net = require("net");
const fs = require("fs");
const { spawn, execSync } = require("child_process");
const path = require("path");

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function getMongodPath() {
  try {
    const whichCmd = process.platform === "win32" ? "where mongod" : "which mongod";
    const out = execSync(whichCmd, { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim()
      .split(/\r?\n/)[0];
    if (out && fs.existsSync(out)) return out;
  } catch (e) {}

  if (process.platform === "win32") {
    const base = "C:\\Program Files\\MongoDB\\Server";
    if (fs.existsSync(base)) {
      const versions = fs.readdirSync(base).sort().reverse();
      for (const v of versions) {
        const candidate = path.join(base, v, "bin", "mongod.exe");
        if (fs.existsSync(candidate)) return candidate;
      }
    }
  }
  return "mongod";
}

function clearStaleMongo(port) {
  try {
    if (process.platform === "win32") {
      // Best-effort check if mongod is running
      // Don't force kill everything indiscriminately, but can clean up if needed
    } else {
      execSync(`lsof -ti tcp:${port} | xargs -r kill -9`, { stdio: "ignore" });
    }
  } catch (error) {
    // ignore
  }
}

function checkPort(port) {
  return new Promise((resolve) => {
    const s = net.createConnection(port, "127.0.0.1");
    s.on("connect", () => {
      s.end();
      resolve(true);
    });
    s.on("error", () => {
      resolve(false);
    });
  });
}

function waitForMongo(port, timeoutMs = 30000) {
  return new Promise((resolve) => {
    const start = Date.now();
    const interval = setInterval(async () => {
      const ok = await checkPort(port);
      if (ok) {
        clearInterval(interval);
        // Small buffer to allow socket initialization
        setTimeout(() => resolve(true), 300);
        return;
      }
      if (Date.now() - start > timeoutMs) {
        clearInterval(interval);
        resolve(false);
      }
    }, 250);
  });
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error(
      "Please specify a command to run with Mongo, e.g. node scripts/run-with-mongo.js src/seed/seed.js",
    );
    process.exit(1);
  }

  const port = 27017;
  const dbPath = path.resolve(__dirname, "../data/db");
  const logPath = path.resolve(__dirname, "../data/mongod.log");
  ensureDir(dbPath);

  clearStaleMongo(port);
  const staleLock = path.join(dbPath, "mongod.lock");
  if (fs.existsSync(staleLock)) {
    try {
      fs.unlinkSync(staleLock);
    } catch (e) {}
  }

  let isUp = await checkPort(port);
  let mongoProc = null;

  if (!isUp) {
    const mongodPath = getMongodPath();
    console.log(`Starting mongod (${mongodPath}) on port ${port}...`);

    const mongoArgs = [
      "--dbpath",
      dbPath,
      "--port",
      port.toString(),
      "--bind_ip",
      "127.0.0.1",
      "--logpath",
      logPath,
    ];

    if (process.platform !== "win32") {
      mongoArgs.unshift("--nounixsocket");
    }

    mongoProc = spawn(mongodPath, mongoArgs, {
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    });

    mongoProc.stdout.on("data", (d) => {
      // debug if needed
    });

    mongoProc.stderr.on("data", (d) => {
      console.error(`[mongod stderr] ${d.toString().trim()}`);
    });

    mongoProc.on("error", (err) => {
      console.error("Failed to spawn mongod:", err);
    });

    mongoProc.on("exit", (code) => {
      if (code !== 0 && code !== null) {
        console.error(`Mongod process exited unexpectedly with code ${code}`);
      }
    });

    const ready = await waitForMongo(port);
    if (ready) {
      console.log(`Mongod is ready on port ${port}!`);
    } else {
      console.error(`Mongod failed to become ready on port ${port} within timeout.`);
    }
  } else {
    console.log(`Mongod is already up on port ${port}.`);
  }

  const targetCmd = args[0];
  const targetArgs = args.slice(1);
  const child = spawn(targetCmd, targetArgs, {
    cwd: path.resolve(__dirname, ".."),
    stdio: "inherit",
    env: process.env,
    shell: process.platform === "win32",
  });

  const cleanup = () => {
    if (mongoProc && !mongoProc.killed) {
      try {
        mongoProc.kill();
      } catch (e) {}
    }
  };

  process.on("SIGINT", () => {
    cleanup();
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    cleanup();
    process.exit(0);
  });

  child.on("exit", (code) => {
    cleanup();
    process.exit(code || 0);
  });
}

main().catch((err) => {
  console.error("Error running command with mongo:", err);
  process.exit(1);
});
