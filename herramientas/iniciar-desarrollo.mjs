import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const opcionesProceso = { stdio: 'inherit', shell: process.platform === 'win32' };
const procesos = [
  spawn('npm', ['run', 'start:dev'], {
    ...opcionesProceso,
    cwd: resolve(raiz, 'Sistema-PawSys-backend'),
  }),
  spawn('npm', ['start'], {
    ...opcionesProceso,
    cwd: resolve(raiz, 'frond'),
  }),
];

let cerrando = false;

function detenerProcesos() {
  if (cerrando) return;
  cerrando = true;
  for (const proceso of procesos) {
    if (!proceso.killed) proceso.kill();
  }
}

for (const proceso of procesos) {
  proceso.on('error', (error) => {
    console.error('No se pudo iniciar uno de los servicios:', error.message);
    process.exitCode = 1;
    detenerProcesos();
  });
  proceso.on('exit', (codigo) => {
    if (!cerrando && codigo !== 0) {
      process.exitCode = codigo ?? 1;
      detenerProcesos();
    }
  });
}

process.on('SIGINT', detenerProcesos);
process.on('SIGTERM', detenerProcesos);