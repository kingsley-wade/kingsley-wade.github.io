import { defineConfig } from "astro/config";

const normalizeBase = (value) => {
  const trimmed = value.trim();
  if (trimmed === "" || trimmed === "/") return "/";
  return `/${trimmed.replace(/^\/+|\/+$/g, "")}`;
};

export default defineConfig({
  output: "static",
  site: process.env.PUBLIC_SITE_URL ?? "https://kingsley-wade.github.io",
  base: normalizeBase(process.env.BASE_URL ?? "/"),
  trailingSlash: "never",
  devToolbar: { enabled: false },
});
