import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { "@typescript-eslint": tseslint.plugin },
    extends: [tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json",
        projectService: true,
        extraFileExtensions: [".vue"],
      },
    },
    rules: {
      // TypeScript rules overrides here
    },
  },
  {
    files: ["**/*.vue"],
    plugins: { "vue": pluginVue },
    extends: [...pluginVue.configs["flat/recommended"]],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser, // use TS parser inside <script> blocks of Vue files
        extraFileExtensions: [".vue"],
        project: "./tsconfig.json",
        projectService: true,
      },
    },
    rules: {
      "vue/no-reserved-component-names": "off"
    },
  },
]);
