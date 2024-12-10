import { build } from "@repo/build";

await build({
  entryPoints: ["./src/server.js"],
  outdir: "dist",
});
