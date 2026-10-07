const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');
const original = code;

// For simple self-closing modals <ProfileModal ... />
code = code.replace(/\{([a-zA-Z0-9_]+)\s*&&\s*\(\s*(<[A-Za-z]+Modal[\s\S]*?\/>)\s*\)\}/g, (match, p1, p2) => p2);

// For simple inline modals {isOpen && <Modal />}
code = code.replace(/\{([a-zA-Z0-9_]+)\s*&&\s*(<[A-Za-z]+Modal[\s\S]*?\/>)\}/g, (match, p1, p2) => p2);

console.log('Replacements made:', original === code ? 'No' : 'Yes');
if (original !== code) fs.writeFileSync('src/App.tsx', code);
