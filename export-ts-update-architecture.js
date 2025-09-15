const fs = require('fs');
const path = require('path');

// Directories to exclude
const excludedDirs = ['node_modules', '.cache', 'cache', 'bin', 'obj', 'dist', '.nx'];
// Files to exclude for brevity
const excludedFiles = ['test-setup.ts', 'tsconfig.json', 'README.md', '.eslintrc.json', 'jest.config.ts'];

// Function to generate folder structure
const getFolderStructure = (dir, level = 0) => {
  let structure = '';
  const files = fs.readdirSync(dir);

  // Filter out excluded directories and files
  const filteredFiles = files.filter((file) => {
    const fullPath = path.join(dir, file);
    const isDirectory = fs.statSync(fullPath).isDirectory();
    const isTsFile = file.endsWith('.ts') && !file.endsWith('.spec.ts');
    return (!excludedDirs.includes(file) && !excludedFiles.includes(file) && (isDirectory || isTsFile)) && !file.endsWith('.spec.ts');
  });

  // Create structure summary
  filteredFiles.forEach((file, index) => {
    const fullPath = path.join(dir, file);
    const isDirectory = fs.statSync(fullPath).isDirectory();
    const indent = '  '.repeat(level);
    const connector = index === filteredFiles.length - 1 ? '└── ' : '├── ';

    // Highlight important directories
    const highlight = ['features', 'store', 'controllers', 'models', 'components', 'utils'].includes(file)
      ? '**' // Add ** for markdown emphasis
      : '';

    structure += `${indent}${connector}${highlight}${file}${highlight}
`;

    // Recursively get subdirectory structure
    if (isDirectory) {
      structure += getFolderStructure(fullPath, level + 1);
    }
  });

  return structure;
};

// Function to generate the architecture document
const generateArchitectureDoc = () => {
  try {
    const architectureFilePath = path.join(__dirname, 'ARCHITECTURE.md');

    const fePath = path.join(__dirname); // Assuming the script is run from the FE/RC directory
    const bePath = path.join(__dirname, '..', '..', 'BE', 'RoyalCode'); // Adjust this to your BE path

    const feFolderStructure = getFolderStructure(fePath);
    const beFolderStructure = getFolderStructure(bePath);

    const architectureContent = `
# Project Architecture

## Frontend Folder Structure
\`\`\`
${feFolderStructure}
\`\`\`

## Backend Folder Structure
\`\`\`
${beFolderStructure}
\`\`\`

### Notes
- Directories like \`node_modules\`, \`.cache\`, and \`dist\` are excluded for brevity.
- Files like \`test-setup.ts\` and \`tsconfig.json\` are omitted for readability.
- Important directories (e.g., \`features\`, \`store\`, \`controllers\`) are highlighted for clarity.

### Challenge Features Overview
- The \`libs/features/challenges\` directory contains multiple submodules for challenge-related features.
  - **core**: Contains the core logic for handling challenges, including business rules and validation.
  - **ui**: Contains UI components specific to challenges, such as challenge cards and forms.
  - **data-access**: Handles API calls and state management related to challenges.
  - **analytics**: Manages challenge tracking, user engagement metrics, and reporting tools.
  - **templates**: Predefined challenge templates that can be used as starting points for new challenges.
`;

    fs.writeFileSync(architectureFilePath, architectureContent, 'utf-8');
    console.log('ARCHITECTURE.md updated with complete folder structures.');
  } catch (error) {
    console.error('Error generating ARCHITECTURE.md:', error);
  }
};

// Run the generateArchitectureDoc function
generateArchitectureDoc();
