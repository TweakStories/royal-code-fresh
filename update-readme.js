const fs = require('fs');
const path = require('path');

// Define paths
const readmeFilePath = path.join(__dirname, 'README.md');
const packageJsonPath = path.join(__dirname, 'package.json');

// Function to update a specific section in the README file
const updateSection = (content, startMarker, endMarker, newContent) => {
  const startIndex = content.indexOf(startMarker) + startMarker.length;
  const endIndex = content.indexOf(endMarker);
  if (startIndex === -1 || endIndex === -1 || startIndex > endIndex) {
    throw new Error('Markers not found or in the wrong order');
  }
  return content.slice(0, startIndex) + '\n' + newContent + '\n' + content.slice(endIndex);
};

// Function to update the README file with package.json
const updateReadme = () => {
  try {
    const readmeContent = fs.readFileSync(readmeFilePath, 'utf-8');
    const packageJson = require(packageJsonPath);

    const packageJsonContent = JSON.stringify(packageJson, null, 2);

    let updatedReadmeContent = readmeContent;
    updatedReadmeContent = updateSection(updatedReadmeContent, '<!-- PACKAGE_JSON_START -->', '<!-- PACKAGE_JSON_END -->', `\`\`\`json\n${packageJsonContent}\n\`\`\``);

    fs.writeFileSync(readmeFilePath, updatedReadmeContent, 'utf-8');
    console.log('README.md updated with package.json contents.');
  } catch (error) {
    console.error('Error updating README.md:', error);
  }
};

// Run the updateReadme function
updateReadme();
