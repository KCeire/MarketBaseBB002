// Global type declarations for CSS imports
declare module '*.css' {
  const content: any;
  export default content;
}

// Specific declarations for the CSS files in layout.tsx
declare module './onchainkit-fix.css';
declare module './theme.css';
declare module '@coinbase/onchainkit/styles.css';
declare module './globals.css';