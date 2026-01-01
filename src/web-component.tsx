/**
 * Web Component Implementation
 *
 * This file creates a custom HTML element (<my-widget>) that can be embedded
 * in any HTML page, even outside of React applications.
 *
 * Key Concepts:
 * - Web Components: Native browser API for creating reusable custom elements
 * - Shadow DOM: Encapsulated styling and DOM (styles don't leak out)
 * - React Integration: Renders React component inside Shadow DOM
 * - Attribute Mapping: Converts HTML attributes (kebab-case) to React props (camelCase)
 *
 * Usage in HTML:
 * <script src="widget.umd.js"></script>
 * <my-widget api-base="https://example.com/api/feedback"></my-widget>
 */

import React from "react";
import { createRoot } from "react-dom/client";
import Widget from "./components/Widget";
import tailwindStyles from "./app/globals.css?inline"; // Inline CSS for Shadow DOM isolation

/**
 * Converts HTML attribute names (kebab-case) to React prop names (camelCase)
 *
 * Example: "api-base" -> "apiBase"
 *
 * @param {string} attribute - HTML attribute name in kebab-case
 * @returns {string} React prop name in camelCase
 */
export const normalizeAttribute = (attribute: string): string => {
  return attribute.replace(/-([a-z])/g, (_, letter: string) =>
    letter.toUpperCase()
  );
};

interface WidgetProps {
  [key: string]: string | undefined;
  apiBase?: string;
}

/**
 * Custom Web Component Class
 *
 * Extends HTMLElement to create a custom HTML element that can be used
 * anywhere in HTML, not just React applications.
 */
class WidgetWebComponent extends HTMLElement {
  /**
   * Constructor - Initializes the custom element
   *
   * Creates a Shadow DOM with "open" mode, which allows:
   * - Style encapsulation (Tailwind styles won't affect parent page)
   * - DOM isolation (widget DOM is separate from page DOM)
   * - JavaScript access (can still access shadowRoot from outside if needed)
   */
  constructor() {
    super();
    this.attachShadow({ mode: "open" }); // Create Shadow DOM for style/DOM isolation
  }

  /**
   * Lifecycle Hook: Called when element is inserted into the DOM
   *
   * This is where we render the React component into the Shadow DOM.
   * Uses React 18's createRoot API for concurrent rendering.
   */
  connectedCallback(): void {
    const props = this.getPropsFromAttributes(); // Convert HTML attributes to React props
    const root = createRoot(this.shadowRoot!); // Create React root in Shadow DOM
    root.render(
      <>
        {/* Inline Tailwind styles for Shadow DOM (Shadow DOM doesn't inherit parent styles) */}
        <style>{tailwindStyles}</style>
        {/* Render the Widget component with props */}
        <Widget {...props} apiBase={props.apiBase} />
      </>
    );
  }

  /**
   * Extracts HTML attributes and converts them to React props
   *
   * Reads all attributes from the HTML element (e.g., <my-widget api-base="...">)
   * and converts them from kebab-case to camelCase for React props.
   *
   * @returns {WidgetProps} Props object with normalized attribute names
   */
  getPropsFromAttributes(): WidgetProps {
    const props: WidgetProps = {};
    // Iterate through all HTML attributes
    for (const { name, value } of this.attributes) {
      props[normalizeAttribute(name)] = value; // Convert "api-base" to "apiBase"
    }
    // If apiBase is not set, default to "/api/feedback"
    if (!props.apiBase) {
      props.apiBase = "/api/feedback";
    }
    return props;
  }
}

// Export for potential programmatic access
export { WidgetWebComponent };

/**
 * Register the Custom Element
 *
 * Defines the custom element only if it hasn't been defined yet.
 * This prevents errors when the script is loaded multiple times.
 *
 * After registration, you can use <my-widget> in any HTML page.
 *
 * IMPORTANT: This code must execute immediately when the script loads.
 * Placed after export to ensure it executes in UMD bundles.
 */
(function registerWidget() {
  if (
    typeof window !== "undefined" &&
    typeof customElements !== "undefined" &&
    !customElements.get("my-widget")
  ) {
    customElements.define("my-widget", WidgetWebComponent);
  }
})();
