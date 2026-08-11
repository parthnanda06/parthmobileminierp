const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../frontend/src');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      callback(path.join(dir, f));
    }
  });
}

function convertToDarkMode(content) {
  let modified = content;

  // Generic Backgrounds
  modified = modified.replace(/bg-white/g, 'bg-white dark:bg-slate-800');
  modified = modified.replace(/bg-slate-50/g, 'bg-slate-50 dark:bg-slate-900/50');
  modified = modified.replace(/bg-slate-100/g, 'bg-slate-100 dark:bg-slate-700/50');
  modified = modified.replace(/bg-\[\#f8fafc\]/g, 'bg-[#f8fafc] dark:bg-[#0f172a]');
  
  // Generic Text
  modified = modified.replace(/text-slate-900/g, 'text-slate-900 dark:text-slate-100');
  modified = modified.replace(/text-slate-800/g, 'text-slate-800 dark:text-slate-200');
  modified = modified.replace(/text-slate-700/g, 'text-slate-700 dark:text-slate-300');
  modified = modified.replace(/text-slate-600/g, 'text-slate-600 dark:text-slate-400');
  
  // Generic Borders
  modified = modified.replace(/border-slate-200/g, 'border-slate-200 dark:border-slate-700');
  modified = modified.replace(/border-slate-300/g, 'border-slate-300 dark:border-slate-600');
  modified = modified.replace(/divide-slate-200/g, 'divide-slate-200 dark:divide-slate-700');
  
  // Inputs
  modified = modified.replace(/ring-slate-300/g, 'ring-slate-300 dark:ring-slate-600');
  
  // Let's not duplicate things if they already exist
  modified = modified.replace(/dark:bg-slate-800 dark:bg-slate-800/g, 'dark:bg-slate-800');
  
  return modified;
}

let count = 0;
walkDir(srcDir, (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    const original = fs.readFileSync(filePath, 'utf8');
    const newContent = convertToDarkMode(original);
    if (original !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      count++;
    }
  }
});

console.log(`Updated ${count} files with Dark Mode classes.`);
