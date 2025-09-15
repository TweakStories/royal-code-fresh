const fs = require('fs');
const path = require('path');

// Define the paths relative to the current working directory
const entitiesDir = path.join(__dirname, '..', '..', 'BE', 'RoyalCode', 'src', 'Domain', 'Entities');
const readmeFilePath = path.join(__dirname, '..', '..', 'BE', 'RoyalCode', 'README.md');

// Function to read all files in the entities directory recursively
function readEntities(directory, folderPath = '') {
  let entitiesContent = '';
  const items = fs.readdirSync(directory);

  items.forEach((item) => {
    const itemPath = path.join(directory, item);
    const relativePath = path.join(folderPath, item);

    if (fs.lstatSync(itemPath).isDirectory()) {
      entitiesContent += `## ${relativePath}\n\n`;
      entitiesContent += readEntities(itemPath, relativePath);
    } else {
      const fileContent = fs.readFileSync(itemPath, 'utf-8');
      entitiesContent += `### ${relativePath}\n\`\`\`csharp\n${fileContent}\n\`\`\`\n\n`;
    }
  });

  return entitiesContent;
}

// Function to get the folder structure
const excludedDirs = ['node_modules', '.cache', 'cache', 'bin', 'obj'];

const getFolderStructure = (dir, indent = '') => {
  let structure = '';
  const files = fs.readdirSync(dir);

  files.forEach((file, index) => {
    const fullPath = path.join(dir, file);
    if (excludedDirs.includes(file)) return;

    const isDirectory = fs.statSync(fullPath).isDirectory();
    const isLastFile = index === files.length - 1;
    const connector = isLastFile ? '└── ' : '├── ';
    const subIndent = isLastFile ? '    ' : '│   ';

    structure += `${indent}${connector}${file}\n`;

    if (isDirectory) {
      structure += getFolderStructure(fullPath, indent + subIndent);
    }
  });

  return structure;
};

// Function to update a specific section in the README file
const updateSection = (content, startMarker, endMarker, newContent) => {
  const startIndex = content.indexOf(startMarker) + startMarker.length;
  const endIndex = content.indexOf(endMarker);
  if (startIndex === -1 || endIndex === -1 || startIndex > endIndex) {
    throw new Error('Markers not found or in the wrong order');
  }
  return content.slice(0, startIndex) + '\n```\n' + newContent + '```\n' + content.slice(endIndex);
};

// Function to update the Backend README file
const updateBackendReadme = () => {
  try {
    const readmeContent = fs.readFileSync(readmeFilePath, 'utf-8');
    const entitiesContent = readEntities(entitiesDir);

    const bePath = path.join(__dirname, '..', '..', 'BE', 'RoyalCode'); // Adjust this to your BE path

    const beFolderStructure = getFolderStructure(bePath);

    let updatedReadmeContent = readmeContent;
    updatedReadmeContent = updateSection(updatedReadmeContent, '<!-- BE_FOLDER_STRUCTURE_START -->', '<!-- BE_FOLDER_STRUCTURE_END -->', beFolderStructure);

    // Append the entities content
    updatedReadmeContent += `\n\n## Entities\n\n${entitiesContent}`;

    fs.writeFileSync(readmeFilePath, updatedReadmeContent, 'utf-8');
    console.log('Backend README.md updated with entities content and folder structures.');
  } catch (error) {
    console.error('Error updating backend README.md:', error);
  }
};

// Run the updateBackendReadme function
updateBackendReadme();
