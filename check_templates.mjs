import fs from 'fs';
const content = fs.readFileSync('src/components/modals/OrderDetailModal.jsx', 'utf8');
const lines = content.split('\n');
let inTemplate = false;
let templateStart = 0;
for(let i = 0; i < lines.length; i++) {
  for(let j = 0; j < lines[i].length; j++) {
    if(lines[i][j] === '`') {
      if(!inTemplate) {
        inTemplate = true;
        templateStart = i + 1;
      } else {
        inTemplate = false;
      }
    }
  }
}
console.log('In template at end:', inTemplate);
console.log('Template started at:', templateStart);
