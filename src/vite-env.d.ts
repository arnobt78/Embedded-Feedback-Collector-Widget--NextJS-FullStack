/// <reference types="vite/client" />

/**
 * Type declarations for Vite-specific module imports
 */

declare module "*.css?inline" {
  const content: string;
  export default content;
}

declare module "*.css?raw" {
  const content: string;
  export default content;
}

