const fs = require('fs');
const path = require('path');

const challengerEntitiesDir = path.join(__dirname, '..', '..', 'BE', 'RoyalCode', 'src', 'Domain', 'Challenger');
const shopEntitiesDir = path.join(__dirname, '..', '..', 'BE', 'RoyalCode', 'src', 'Domain', 'Shop');
const configurationsDir = path.join(__dirname, '..', '..', 'BE', 'RoyalCode', 'src', 'Infrastructure', 'Data', 'Configurations');
const modelsFilePath = path.join(__dirname, 'DATABASE.md');

// Function to remove 'using' statements and comments
function readEntities(directory, folderPath = '', sectionTitle = '') {
  let entitiesContent = '';
  const items = fs.readdirSync(directory);

  if (sectionTitle) {
    entitiesContent += `# ${sectionTitle}\n\n`;
  }

  items.forEach((item) => {
    const itemPath = path.join(directory, item);
    const relativePath = path.join(folderPath, item);

    if (fs.lstatSync(itemPath).isDirectory()) {
      entitiesContent += `## Directory: ${relativePath}\n\n`;
      entitiesContent += readEntities(itemPath, relativePath);
    } else {
      const fileContent = fs.readFileSync(itemPath, 'utf-8');

      // Remove 'using' lines, single-line comments (//), and multi-line comments (/* ... */)
      const filteredContent = fileContent
        .replace(/\/\/.*$/gm, '') // Remove single-line comments
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
        .split('\n')
        .filter(line => !line.trim().startsWith('using')) // Remove 'using' statements
        .join('\n');

      // Reduce line breaks
      const cleanedContent = filteredContent.replace(/\n{2,}/g, '\n');

      entitiesContent += `File: ${relativePath}\n${cleanedContent}\n\n`;
    }
  });

  return entitiesContent;
}

// Main function to update the DATABASE.md file
const updateModels = () => {
  try {
    const challengerEntitiesContent = readEntities(challengerEntitiesDir, '', 'Challenger Entities');
    const shopEntitiesContent = readEntities(shopEntitiesDir, '', 'Shop Entities');
    const configurationsContent = readEntities(configurationsDir, '', 'Configurations');

    let updatedModelsContent = `# Backend Models and Configurations\n\n${challengerEntitiesContent}${shopEntitiesContent}${configurationsContent}`;

    fs.writeFileSync(modelsFilePath, updatedModelsContent, 'utf-8');
    console.log('DATABASE.md updated with entities content.');
  } catch (error) {
    console.error('Error updating DATABASE.md:', error);
  }
};

updateModels();
