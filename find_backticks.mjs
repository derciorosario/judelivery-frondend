import fs from 'fs';
const content = fs.readFileSync('src/components/modals/OrderDetailModal.jsx', 'utf8');
const lines = content.split('\n');
for(let i = 0; i < lines.length; i++) {
  if(lines[i].includes('`')) {
    console.log((i+1) + ': ' + lines[i].trim());
  }
}
