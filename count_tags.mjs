import fs from 'fs';
const content = fs.readFileSync('src/components/modals/OrderDetailModal.jsx', 'utf8');
const lines = content.split('\n');

let divOpen = 0;
let divClose = 0;
let otherOpen = 0;
let otherClose = 0;

for(let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for(let j = 0; j < line.length; j++) {
    if(line[j] === '<') {
      if(line.slice(j, j+4) === '<div') {
        divOpen++;
      } else if(line.slice(j, j+6) === '</div>') {
        divClose++;
      } else if(line[j+1] !== '/' && line[j+1] !== '!' && line[j+1] !== '?' && line[j+1] !== 'M') {
        // Count other opening tags
        const match = line.slice(j).match(/^<([a-zA-Z][a-zA-Z0-9]*)/);
        if(match) {
          otherOpen++;
        }
      }
    } else if(line[j] === '/' && line[j+1] === '>') {
      // self-closing tag
    }
  }
}

console.log('Div open:', divOpen, 'Div close:', divClose, 'Diff:', divOpen - divClose);
console.log('Other open:', otherOpen);
