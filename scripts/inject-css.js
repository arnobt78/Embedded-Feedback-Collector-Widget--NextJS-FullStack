/**
 * Script to inject CSS into web-component.tsx as a string constant
 * This ensures CSS is always included in the UMD bundle
 */

const fs = require("fs");
const path = require("path");

const cssPath = path.join(__dirname, "../src/assets/widget-styles.css");
const componentPath = path.join(__dirname, "../src/web-component.tsx");

if (!fs.existsSync(cssPath)) {
  console.error("❌ CSS file not found:", cssPath);
  console.error("   Run: npm run build:widget-css");
  process.exit(1);
}

// Read the CSS file
const cssContent = fs.readFileSync(cssPath, "utf8");

// Escape the CSS string for JavaScript template literal
const escapedCss = cssContent
  .replace(/\\/g, "\\\\") // Escape backslashes
  .replace(/`/g, "\\`") // Escape backticks
  .replace(/\${/g, "\\${"); // Escape template literal expressions

// Read the component file
let componentContent = fs.readFileSync(componentPath, "utf8");

// Create the replacement code
const replacement = `// CSS is injected at build time via scripts/inject-css.js
const tailwindStyles = \`${escapedCss}\`;`;

// Find and replace lines 22-24 (the import section)
const lines = componentContent.split('\n');
let startLine = -1;
let endLine = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Import pre-built CSS')) {
    startLine = i;
  }
  if (startLine !== -1 && lines[i].includes('import tailwindStyles')) {
    endLine = i;
    break;
  }
}

if (startLine !== -1 && endLine !== -1) {
  // Replace lines with the CSS constant
  lines.splice(startLine, endLine - startLine + 1, replacement);
  componentContent = lines.join('\n');
  fs.writeFileSync(componentPath, componentContent, "utf8");
  console.log("✅ CSS injected into web-component.tsx");
  console.log(`   CSS size: ${(cssContent.length / 1024).toFixed(2)} KB`);
} else {
  console.error("❌ Could not find import statement to replace");
  process.exit(1);
}
