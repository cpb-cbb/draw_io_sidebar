const fs = require('fs');
let content = fs.readFileSync('content.css', 'utf8');

// Header buttons
content = content.replace(
  /\.drawio-ai-icon-btn \{\s*.*?cursor: pointer;\s*\}/g,
  `.drawio-ai-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  width: 30px;
  height: 30px;
  border-radius: 4px;
  font-size: 14px;
  color: var(--da-text-soft);
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;
}`
);

// Icon hover
if (!content.includes('.drawio-ai-icon-btn:hover')) {
  content = content.replace(
    /\.drawio-ai-icon-btn \{[\s\S]*?\}/,
    match => match + `\n.drawio-ai-icon-btn:hover {\n  background: var(--da-border-soft);\n  border-color: var(--da-border-main);\n  color: var(--da-text-main);\n}`
  );
}

// Button hover general
if (!content.includes('.drawio-ai-btn.secondary:hover')) {
  content = content.replace(
    /\.drawio-ai-btn\.secondary \{[\s\S]*?\}/,
    match => match + `\n.drawio-ai-btn.secondary:hover {\n  background: var(--da-secondary-btn-hover);\n}`
  );
}

content = content.replace(
  /\.drawio-ai-btn\.primary:hover \{\s*opacity: 0\.9;\s*\}/,
  `.drawio-ai-btn.primary:hover {
  background: var(--da-primary-2);
}`
);

fs.writeFileSync('content.css', content);
