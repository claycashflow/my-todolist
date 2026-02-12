import fs from 'fs';
import path from 'path';

// Function to add .js extension to relative imports in compiled files
function addJsExtension(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Regular expression to match relative imports without extensions
  // Matches: from './something', from '../something', or from '../something/something' but not from 'package-name' or from '@alias/something'
  const relativeImportRegex = /(from\s+["'](\.\.\/|\.\/|\.\\|\.\.\\)[^"'@][^"']*["'])/g;
  
  let updatedContent = content.replace(relativeImportRegex, (match) => {
    // Extract the import path
    const quoteMatch = match.match(/(["'])(.*?)(["'])/);
    if (quoteMatch) {
      const quote = quoteMatch[1];
      let importPath = quoteMatch[2];
      
      // Only add .js if it doesn't already have an extension
      if (!/\.(js|ts|json|mjs|cjs)$/.test(importPath)) {
        importPath += '.js';
      }
      
      return match.replace(quoteMatch[0], `${quote}${importPath}${quote}`);
    }
    return match;
  });
  
  fs.writeFileSync(filePath, updatedContent, 'utf8');
}

// Walk through build directory and fix imports
function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDirectory(filePath);
    } else if (file.endsWith('.js')) {
      addJsExtension(filePath);
      console.log(`Fixed imports in ${filePath}`);
    }
  }
}

// Start the process
console.log('Fixing import extensions in build directory...');
walkDirectory('./build');
console.log('Done!');