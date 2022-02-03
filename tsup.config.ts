import { defineConfig } from "tsup";

export default defineConfig({
	clean: true,
	bundle: false,
	dts: false,
	entry: ["src/**/*.ts"],
	format: ["cjs"],
	minify: false,
	tsconfig: "tsconfig.json",
	target: "esnext",
	splitting: false,
	skipNodeModulesBundle: true,
	sourcemap: true,
	shims: false,
	keepNames: true,
});
