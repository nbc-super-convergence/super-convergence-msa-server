import * as esbuild from "esbuild";

export const build = async (options) => {
  const defaultOptions = {
    bundle: true,
    platform: "node",
    format: "esm",
    minify: true,
    sourcemap: false,
    target: "node20",
    external: [
      "util",
      "net",
      "fs",
      "path",
      "url",
      "protobufjs",
      "winston",
      "winston-daily-rotate-file",
      "@repo/common", // common도 번들링 제외
    ],
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    loader: {
      ".proto": "file", // .proto도 파일로 처리
    },
  };

  await esbuild.build({
    ...defaultOptions,
    ...options,
  });
};
