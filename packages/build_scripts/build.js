import * as esbuild from 'esbuild';

export const build = async (options) => {
  const defaultOptions = {
    bundle: true,
    platform: 'node',
    format: 'esm',
    minify: true,
    sourcemap: false,
    target: 'node20',
    external: [
      'node:*',
      'protobufjs',
      'winston',
      'winston-daily-rotate-file',
      '@repo/common', // common도 번들링 제외
      'bcrypt',
      'mysql2',
      'joi',
      'dotenv',
    ],
    define: {
      'process.env.NODE_ENV': '"production"',
    },
    loader: {
      '.proto': 'file', // .proto도 파일로 처리
      '.env': 'file',
    },
  };

  await esbuild.build({
    ...defaultOptions,
    ...options,
  });
};
