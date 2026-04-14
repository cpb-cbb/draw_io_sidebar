const fs = require('fs');
let css = fs.readFileSync('content.css', 'utf8');

css = css.replace(/--da-secondary-btn-bg: #ffffff;/, '--da-secondary-btn-bg: #f5f5f5;');

// add hover var
if (!css.includes('--da-secondary-btn-hover')) {
    css = css.replace(/--da-secondary-btn-bg: #f5f5f5;/, '--da-secondary-btn-bg: #f5f5f5;\n  --da-secondary-btn-hover: #e5e5e5;');
}

fs.writeFileSync('content.css', css);
console.log('Done buttons');
