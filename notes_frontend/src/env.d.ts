/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly PUBLIC_NOTES_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
