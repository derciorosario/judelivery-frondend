import fs from 'fs';
const content = fs.readFileSync('src/components/modals/OrderDetailModal.jsx', 'utf8');
const lines = content.split('\n');
let braces = 0;
let firstPositive = 0;
for(let i = 0; i < lines.length; i++) {
  for(let j = 0; j < lines[i].length; j++) {
    const c = lines[i][j];
    if(c === '{') braces++;
    else if(c === '}') braces--;
  }
  if(braces > 0 && firstPositive === 0) {
    firstPositive = i + 1;
  }
}
console.log('First line with positive braces:', firstPositive);
console.log('Final brace count:', braces);

// Now find the exact line/col where the unclosed brace is
braces = 0;
for(let i = 0; i < lines.length; i++) {
  for(let j = 0; j < lines[i].length; j++) {
    const c = lines[i][j];
    if(c === '{') {
      braces++;
      if(braces === 1 && firstPositive > 0 && i+1 >= firstPositive) {
        console.log('Unclosed { at line', i+1, 'col', j+1);
        console.log('Line content:', lines[i].trim());
      }
    } else if(c === '}') {
      braces--;
    }
  }
}
