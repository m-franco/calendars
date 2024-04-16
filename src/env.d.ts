/// <reference types="astro/client" />
interface ImportMetaEnv {
    readonly PUBLIC_IMAGE_PATH: string;
    // more env variables...
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }