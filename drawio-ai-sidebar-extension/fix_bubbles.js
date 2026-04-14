const fs = require('fs');
let css = fs.readFileSync('content.css', 'utf8');

css = css.replace(/--da-user-msg-bg: #fff0df;/, '--da-user-msg-bg: #ffe6cc;');
css = css.replace(/--da-user-msg-border: transparent;/, '--da-user-msg-border: #d79b00;');

css = css.replace(/\.drawio-ai-user-message\s*\{[\s\S]*?\}/, match => {
    // Make sure border is applied if it was removed
    if (!match.includes('border:')) {
        return match.replace(/background:/, 'border: 1px solid var(--da-user-msg-border);\n  background:');
    }
    return match;
});

css = css.replace(/\.drawio-ai-bot-message\s*\{[\s\S]*?\}/, match => {
    if (!match.includes('border:')) {
        return match.replace(/background:/, 'border: 1px solid #cccccc;\n  background:');
    }
    return match;
});

fs.writeFileSync('content.css', css);
