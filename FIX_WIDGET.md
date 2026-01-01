# Fix Widget CSS - Commands

```bash
cd /Users/arnob_t78/Projects/NextJS/feedback-widget

# Build widget (includes CSS build + injection)
npm run build:widget

# Test locally
npm run dev
# Visit: http://localhost:3000/test-widget.html
```

**Note:** `build:widget` automatically runs `build:widget-css` which builds the CSS and injects it into the component.
