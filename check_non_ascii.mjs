import fs from 'fs';
const content = fs.readFileSync('src/components/modals/OrderDetailModal.jsx', 'utf8');
const lines = content.split('\n');
for(let i = 0; i < lines.length; i++) {
  for(let j = 0; j < lines[i].length; j++) {
    const code = lines[i].charCodeAt(j);
    if(code > 127) {
      console.log(`Non-ASCII at line ${i+1}, col ${j+1}: char code ${code}`);
    }
  }
}
console.log('Done checking non-ASCII characters');
