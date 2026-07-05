const { execSync, spawn } = require('child_process');

const PORT = 4000;

function getPidOnPort(port) {
  try {
    if (process.platform === 'win32') {
      const output = execSync(`netstat -ano`).toString();
      const lines = output.split('\n');
      for (const line of lines) {
        if (line.includes(`:${port}`) && line.includes('LISTENING')) {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid && !isNaN(pid)) {
            return parseInt(pid, 10);
          }
        }
      }
    } else {
      const output = execSync(`lsof -t -i:${port}`).toString().trim();
      if (output) {
        return parseInt(output, 10);
      }
    }
  } catch (error) {
    // Port not in use or command failed
  }
  return null;
}

function getProcessInfo(pid) {
  try {
    if (process.platform === 'win32') {
      const cmdOutput = execSync(`powershell -Command "Get-CimInstance Win32_Process -Filter 'ProcessId = ${pid}' | Select-Object -ExpandProperty CommandLine"`, { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim();
      return cmdOutput || 'Node process (command line unknown)';
    } else {
      const cmdOutput = execSync(`ps -p ${pid} -o command=`, { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim();
      return cmdOutput || 'Node process';
    }
  } catch (e) {
    return 'Node process (active)';
  }
}

function status() {
  const pid = getPidOnPort(PORT);
  if (pid) {
    const info = getProcessInfo(pid);
    console.log(`\n🟢 Port ${PORT} is ACTIVE.`);
    console.log(`   Process ID (PID): ${pid}`);
    console.log(`   Command: ${info}\n`);
    return pid;
  } else {
    console.log(`\n🔴 Port ${PORT} is NOT active (idle).\n`);
    return null;
  }
}

function stop() {
  const pid = getPidOnPort(PORT);
  if (!pid) {
    console.log(`\nℹ️ Port ${PORT} is already idle. Nothing to stop.\n`);
    return false;
  }

  console.log(`Stopping process ${pid} on port ${PORT}...`);
  try {
    if (process.platform === 'win32') {
      execSync(`taskkill /F /PID ${pid}`);
    } else {
      execSync(`kill -9 ${pid}`);
    }
    console.log(`\n✅ Successfully stopped process on port ${PORT}.\n`);
    return true;
  } catch (error) {
    console.error(`\n❌ Failed to stop process ${pid}:`, error.message, '\n');
    return false;
  }
}

function start() {
  const pid = getPidOnPort(PORT);
  if (pid) {
    console.log(`\n⚠️ Port ${PORT} is already in use by process ${pid}.`);
    console.log(`   Please stop it first using 'npm run sml:stop' or run 'npm run sml:restart'.\n`);
    process.exit(1);
  }

  console.log(`\n🚀 Starting Semantic Memory Layer (SML) on port ${PORT}...\n`);
  const child = spawn('npm', ['--prefix', 'saule-core', 'run', 'start'], {
    shell: true,
    stdio: 'inherit'
  });

  child.on('exit', (code) => {
    process.exit(code || 0);
  });
}

function restart() {
  const stopped = stop();
  // Wait a moment before starting to ensure the port is freed
  const delay = stopped ? 1500 : 0;
  setTimeout(() => {
    start();
  }, delay);
}

const command = process.argv[2];

switch (command) {
  case 'start':
    start();
    break;
  case 'stop':
    stop();
    break;
  case 'status':
    status();
    break;
  case 'restart':
    restart();
    break;
  default:
    console.log(`Usage: node scripts/manage-sml.js [start|stop|status|restart]`);
    process.exit(1);
}
