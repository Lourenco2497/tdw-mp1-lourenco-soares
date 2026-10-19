import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

const config = [
  { ignores: [".next/**", "out/**", "coverage/**", "next-env.d.ts"] },
  ...compat.extends("next/core-web-vitals"),
  ...compat.extends("next/typescript").map((config) => ({
    ...config,
    files: ["**/*.ts", "**/*.tsx"],
  })),
  ...compat.extends("prettier"),
];

export default config;
