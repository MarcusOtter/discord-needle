import { defineConfig } from "tsup";

export default defineConfig({
	clean: true,
	bundle: false,
	dts: false,
	entry: ["src/**/*.ts", "src/config.json"],
	format: ["cjs"],
	minify: false,
	tsconfig: "tsconfig.json",
	target: "node16.14",
	splitting: false,
	skipNodeModulesBundle: true,
	sourcemap: true,
	shims: false,
	keepNames: true,
});
