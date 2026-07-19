import fs from 'fs';
const content = fs.readFileSync('src/components/modals/OrderDetailModal.jsx', 'utf8');
const lines = content.split('\n');

let divCount = 0;
for(let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const divs = line.match(/<div[>\s]/g) || [];
  const closes = line.match(/<\/div>/g) || [];
  divCount += divs.length - closes.length;
  if(divCount !== 0 && i > 1500) {
    console.log(`Line ${i+1}: divCount=${divCount} | ${line.trim().slice(0, 80)}`);
  }
}
