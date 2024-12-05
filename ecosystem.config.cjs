module.exports = {
  apps: [
    {
      name: 'distributor',
      script: './apps/distributor/dist/server.js',
      instances: 1,
      exec_mode: 'fork',
    },
    {
      name: 'gate',
      script: './apps/gate/dist/server.js',
      instances: 1,
      exec_mode: 'fork',
    },
    {
      name: 'auth',
      script: './apps/auth/dist/server.js',
      instances: 1,
      exec_mode: 'fork',
    },
    {
      name: 'lobby',
      script: './apps/lobby/dist/server.js',
      instances: 1,
      exec_mode: 'fork',
    },
    {
      name: 'room',
      script: './apps/room/dist/server.js',
      instances: 1,
      exec_mode: 'fork',
    },
    {
      name: 'board',
      script: './apps/board/dist/server.js',
      instances: 1,
      exec_mode: 'fork',
    },
    {
      name: 'ice',
      script: './apps/ice/dist/server.js',
      instances: 1,
      exec_mode: 'fork',
    },
  ],
};
