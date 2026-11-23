import { spawnSync } from 'node:child_process';

const tareas = [
  {
    argumentos: [
      'node_modules/typescript/bin/tsc',
      '-p',
      'tsconfig.app.json',
      '--noEmit',
    ],
  },
  {
    argumentos: ['node_modules/vite/bin/vite.js', 'build'],
  },
];

for (const tarea of tareas) {
  const resultado = spawnSync(process.execPath, tarea.argumentos, {
    stdio: 'inherit',
  });

  if (resultado.error) {
    throw resultado.error;
  }

  if (resultado.status !== 0) {
    process.exit(resultado.status ?? 1);
  }
}
