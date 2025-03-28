const fs = require('fs');
const path = require('path');

// Define paths
const sourcePath = path.join(__dirname, '../../mongodump_full_snapshot');
const destPath = path.join(__dirname, '../../public/data');

// Create destination directory if it doesn't exist
if (!fs.existsSync(destPath)) {
  fs.mkdirSync(destPath, { recursive: true });
}

// List of CSV files to copy
const filesToCopy = [
  'incidents.csv',
  'reports.csv',
  'classifications_CSETv1.csv'
];

// Copy files
filesToCopy.forEach(file => {
  const sourceFile = path.join(sourcePath, file);
  const destFile = path.join(destPath, file);
  
  if (fs.existsSync(sourceFile)) {
    fs.copyFileSync(sourceFile, destFile);
    console.log(`Copied ${file} to ${destPath}`);
  } else {
    console.error(`Error: File ${sourceFile} does not exist`);
  }
});

console.log('Data preparation complete');