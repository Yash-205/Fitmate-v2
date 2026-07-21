# Markdown Documentation Guidelines

When creating or modifying markdown files in this repository, the following rules must **always** be followed:

## 1. Table of Contents / Overview
Every markdown file must begin with an overview or index of every major heading. This ensures the document is easily scannable and readers understand the structure immediately.

## 2. Code Spacing
There must always be exactly **one empty line space** between each line of code inside any markdown code block. This improves readability by double-spacing the code.

**Correct:**
```javascript

const example = "code block";

const anotherLine = "this is double spaced";

console.log(example);

```

**Incorrect:**
```javascript
const example = "code block";
const anotherLine = "this is not double spaced";
console.log(example);
```

## 3. Visualizing Logic (Mermaid Diagrams)
Whenever explaining complex flows, architecture, state lifecycles, or processes, **Mermaid diagrams must be used** (e.g., `sequenceDiagram`, `flowchart`, etc.). Visualizing the theory or process is a strict requirement for high-quality documentation.

## 4. No Images
**No images** should ever be used or embedded in the markdown files. Rely entirely on Mermaid diagrams, code blocks, and markdown tables to convey visual information.
