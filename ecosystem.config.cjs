module.exports = {
  apps: [
    {
      name: 'distributor',
      script: './apps/distributor/src/server.js',
      instances: 1,
      exec_mode: 'fork',
    },
    {
      name: 'gate',
      script: './apps/gate/src/server.js',
      instances: 1,
      exec_mode: 'fork',
    },
    {
      name: 'auth',
      script: './apps/auth/src/server.js',
      instances: 1,
      exec_mode: 'fork',
    },
    {
      name: 'lobby',
      script: './apps/lobby/src/server.js',
      instances: 1,
      exec_mode: 'fork',
    },
    {
      name: 'room',
      script: './apps/room/src/server.js',
      instances: 1,
      exec_mode: 'fork',
    },
    {
      name: 'board',
      script: './apps/board/src/server.js',
      instances: 1,
      exec_mode: 'fork',
    },
    {
      name: 'ice',
      script: './apps/ice/src/server.js',
      instances: 1,
      exec_mode: 'fork',
    },
  ],
};
