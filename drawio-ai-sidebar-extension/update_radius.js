const fs = require('fs');
let css = fs.readFileSync('content.css', 'utf8');

// message bubbles
css = css.replace(/(\.drawio-ai-user-message[\s\S]*?)border-radius:\s*1[0-9]px;/g, '$1border-radius: 6px;');
css = css.replace(/(\.drawio-ai-bot-message[\s\S]*?)border-radius:\s*1[0-9]px;/g, '$1border-radius: 6px;');
css = css.replace(/(\.drawio-ai-api-error[\s\S]*?)border-radius:\s*1[0-9]px;/g, '$1border-radius: 6px;');
css = css.replace(/(\.drawio-ai-api-success[\s\S]*?)border-radius:\s*1[0-9]px;/g, '$1border-radius: 6px;');
css = css.replace(/(\.drawio-ai-api-pending[\s\S]*?)border-radius:\s*1[0-9]px;/g, '$1border-radius: 6px;');

// inputs and panels
css = css.replace(/border-radius:\s*1[0-9]px;/g, 'border-radius: 4px;');
css = css.replace(/border-radius:\s*999px;/g, 'border-radius: 12px;');

css = css.replace(/box-shadow: -22px 0 46px rgba.*;/, 'box-shadow: -2px 0 10px rgba(0,0,0,0.1);');

fs.writeFileSync('content.css', css);
console.log('Done');
