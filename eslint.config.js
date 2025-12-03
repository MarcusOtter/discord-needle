import { defineConfig, globalIgnores } from "eslint/config";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all,
});

export default defineConfig([
	globalIgnores(["**/node_modules/", "**/dist/", "**/configs/"]),
	{
		extends: compat.extends("eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"),

		plugins: {
			"@typescript-eslint": typescriptEslint,
		},

		languageOptions: {
			globals: {
				...globals.node,
			},

			ecmaVersion: 2021,
			sourceType: "module",
		},

		rules: {
			eqeqeq: "error",
			"handle-callback-err": "off",

			"max-nested-callbacks": [
				"error",
				{
					max: 4,
				},
			],

			"max-statements-per-line": [
				"error",
				{
					max: 2,
				},
			],

			"no-console": "off",
			"no-empty-function": "error",
			"no-lonely-if": "error",
			"no-shadow": "off",
			"@typescript-eslint/no-shadow": ["error"],
			"no-var": "error",
			"prefer-const": "error",

			quotes: [
				"error",
				"double",
				{
					avoidEscape: true,
				},
			],

			"spaced-comment": ["error", "always"],
			yoda: "error",
			curly: ["error", "multi-line", "consistent"],
			"comma-dangle": "off",
		},
	},
]);
