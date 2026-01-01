const fs = require("fs");
const path = require("path");

const cssPath = path.join(__dirname, "../public/widget-styles.css");
const outputPath = path.join(__dirname, "../src/widget-styles.ts");

if (!fs.existsSync(cssPath)) {
  console.error("❌ CSS file not found. Run: npm run build:widget-css");
  process.exit(1);
}

const css = fs.readFileSync(cssPath, "utf8");
const escaped = css.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\${/g, "\\${");

const content = `/**
 * Widget CSS - Auto-generated, do not edit
 */
export const widgetStyles = \`${escaped}\`;`;

fs.writeFileSync(outputPath, content, "utf8");
console.log("✅ CSS exported to widget-styles.ts");

