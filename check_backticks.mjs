import fs from 'fs';
const content = fs.readFileSync('src/components/modals/OrderDetailModal.jsx', 'utf8');
const matches = content.match(/[`]/g);
console.log('Backtick count:', matches ? matches.length : 0);
