import fs from 'fs';
import path from 'path';

const REPLACEMENTS = [
  // Primary dark
  { from: /#123E52/gi, to: '#0F172A' },
  { from: /#0C2C3D/gi, to: '#020617' },
  // Accent rose / sculpt coral
  { from: /#397F86/gi, to: '#E11D48' },
  { from: /#306E76/gi, to: '#BE123C' },
  // Studio surface
  { from: /#F7F3E8/gi, to: '#F8FAFC' },
  // Borders & muted text
  { from: /#DDDCD3/gi, to: '#E2E8F0' },
  { from: /#526B76/gi, to: '#64748B' },
  // Text descriptions in comments
  { from: /Deep Forest Green/gi, to: 'Deep Obsidian' },
  { from: /Sage Green/gi, to: 'Electric Rose' },
  { from: /Warm cream/gi, to: 'Studio White' }
];

function processDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.next' && entry.name !== '.git') {
        processDir(fullPath);
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (['.ts', '.tsx', '.js', '.jsx', '.css', '.json', '.html'].includes(ext)) {
        let content = fs.readFileSync(fullPath, 'utf8');
        let modified = false;
        for (const { from, to } of REPLACEMENTS) {
          if (from.test(content)) {
            content = content.replace(from, to);
            modified = true;
          }
        }
        if (modified) {
          fs.writeFileSync(fullPath, content, 'utf8');
          console.log(`Updated: ${path.relative(process.cwd(), fullPath)}`);
        }
      }
    }
  }
}

console.log('Starting color rebranding across src/ ...');
processDir(path.join(process.cwd(), 'src'));
console.log('Completed color rebranding across src/');
