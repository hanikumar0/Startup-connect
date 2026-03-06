import { execSync } from 'child_process';
import os from 'os';

const PORTS = [5000, 5005];

const cleanup = () => {
  if (os.platform() === 'win32') {
    PORTS.forEach(PORT => {
      try {
        const stdout = execSync(`netstat -ano | findstr :${PORT}`, { timeout: 2000 }).toString();
        const lines = stdout.split('\n');
        
        const pids = new Set();
        lines.forEach(line => {
          const parts = line.trim().split(/\s+/);
          if (parts.length > 4 && parts[1].includes(`:${PORT}`)) {
            const pid = parts[parts.length - 1];
            if (pid && pid !== '0' && pid !== process.pid.toString()) {
              pids.add(pid);
            }
          }
        });

        pids.forEach(pid => {
          try {
            console.log(`🧹 Attempting to clear zombie process ${pid} on port ${PORT}...`);
            execSync(`taskkill /F /T /PID ${pid}`, { timeout: 1000, stdio: 'ignore' });
          } catch (e) {
            // Silence errors
          }
        });
      } catch (e) {
        // No process on this port
      }
    });
  }
};

cleanup();
console.log(`✅ Ports ${PORTS.join(', ')} are ready.`);
process.exit(0);
