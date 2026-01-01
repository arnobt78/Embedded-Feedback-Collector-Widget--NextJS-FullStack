const fs = require("fs");
const path = require("path");

const cssPath = path.join(__dirname, "../public/widget-styles.css");
const componentPath = path.join(__dirname, "../src/web-component.tsx");

if (!fs.existsSync(cssPath)) {
  console.error("❌ CSS file not found. Run: npm run build:widget-css");
  process.exit(1);
}

const css = fs.readFileSync(cssPath, "utf8");
const escaped = css.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\${/g, "\\${");

let componentContent = fs.readFileSync(componentPath, "utf8");

// Check if CSS is already inlined
const alreadyInlined = /const widgetStyles = `/.test(componentContent);
const importRegex = /import\s+\{\s*widgetStyles\s*\}\s+from\s+['"]\.\/widget-styles['"];/;

if (alreadyInlined) {
  // Replace existing inline constant
  const existingRegex = /\/\/ CSS injected at build time\nconst widgetStyles = `[^`]*`;/s;
  const replacement = `// CSS injected at build time
const widgetStyles = \`${escaped}\`;`;
  
  if (existingRegex.test(componentContent)) {
    componentContent = componentContent.replace(existingRegex, replacement);
    fs.writeFileSync(componentPath, componentContent, "utf8");
    console.log("✅ CSS updated in web-component.tsx");
  } else {
    console.log("⚠️  CSS already inlined but couldn't update (using existing)");
  }
} else if (importRegex.test(componentContent)) {
  // Replace import with inline constant
  const replacement = `// CSS injected at build time
const widgetStyles = \`${escaped}\`;`;
  componentContent = componentContent.replace(importRegex, replacement);
  fs.writeFileSync(componentPath, componentContent, "utf8");
  console.log("✅ CSS inlined into web-component.tsx");
} else {
  console.error("❌ Could not find widgetStyles import or inline constant in web-component.tsx");
  process.exit(1);
}

