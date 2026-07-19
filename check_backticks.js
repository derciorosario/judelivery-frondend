const fs = require('fs');
const content = fs.readFileSync('src/components/modals/OrderDetailModal.jsx', 'utf8');
const lines = content.split('\n');
let backticks = 0;
for(let i = 0; i < lines.length; i++) {
  for(let j = 0; j < lines[i].length; j++) {
    if(lines[i][j] === '`') backticks++;
  }
}
console.log('Backticks:', backticks);
if(backticks % 2 !== 0) console.log('UNCLOSED BACKTICK!');
