import * as esbuild from "esbuild";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function getEsbuildConfig(servicePath) {
  return {
    entryPoints: [path.resolve(servicePath, "src/server.js")],
    outfile: path.resolve(servicePath, "dist/server.js"),
    bundle: true,
    platform: "node",
    target: "node20",
    sourcemap: true,
    minify: true,
  };
}

const servicePath = process.argv[2]; // 빌드할 서비스 경로를 인자로 받음
if (!servicePath) {
  console.error("Error: Service path not specified.");
  process.exit(1);
}

const absServicePath = path.resolve(__dirname, "../../", servicePath);

async function build() {
  try {
    const config = getEsbuildConfig(absServicePath);
    await esbuild.build(config);
    console.log(`Build completed for: ${servicePath}`);
  } catch (err) {
    console.error("Build failed:", err);
    process.exit(1);
  }
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
