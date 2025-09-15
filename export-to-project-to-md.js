"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs/promises");
const path = require("path");

// ==================================================================================
// === CONFIGURATIE ===
// ==================================================================================

const OUTPUT_FILE = '_docs/nx-configs.md';
const BASE_PATH = path.resolve('.'); // Root van de workspace.

/**
 * @const {string[]} CONFIG_PATTERNS
 * @description Patronen voor bestandsnamen die we willen verzamelen (case-insensitive).
 *              Voeg toe/haal weg wat relevant is voor je setup.
 */
const CONFIG_PATTERNS = [
  'package.json',
  'project.json',
  'tsconfig.json',
  'tsconfig.base.json',
  'tsconfig.app.json',
  'tsconfig.spec.json',
  'tsconfig.editor.json',
  '.eslintrc.json',
  '.eslintrc.js',
  '.eslintrc.cjs',
  'jest.config.ts',
  'jest.config.js',
  'nx.json',
  'migrations.json',
  'angular.json', // Als het een Angular workspace is.
  '.prettierrc',
  '.prettierrc.json',
  'vite.config.ts', // Indien Vite gebruikt.
  'vitest.config.ts',
];

/**
 * @const {string[]} EXCLUDED_PATTERNS
 * @description Paden en patronen die altijd moeten worden uitgesloten.
 */
const EXCLUDED_PATTERNS = [
  'node_modules',
  '/dist/',
  '/.nx/',
  '/coverage/',
  '/.angular/',
  '/.vscode/',
  '/.idea/',
  '/src/assets/',
  '/src/environments/',
];

/**
 * @const {boolean} SORT_FILES
 * @description Sorteer de bestandslijst alfabetisch.
 */
const SORT_FILES = true;

// === HULPFUNCTIES ===

async function getAllConfigFiles(dirPath) {
    let files = [];
    try {
        const items = await fs.readdir(dirPath, { withFileTypes: true });
        for (const item of items) {
            const fullPath = path.join(dirPath, item.name);
            if (isExcluded(fullPath)) continue;

            if (item.isDirectory()) {
                files = files.concat(await getAllConfigFiles(fullPath));
            } else if (isConfigFile(item.name)) {
                files.push(fullPath);
            }
        }
    } catch (err) {
        console.warn(`⚠️ Map niet gevonden of error: ${path.relative(BASE_PATH, dirPath)}. Overslaan. Error: ${err.message}`);
    }
    return files;
}

function isConfigFile(fileName) {
    const lowerName = fileName.toLowerCase();
    return CONFIG_PATTERNS.some(pattern => lowerName === pattern.toLowerCase() || 
        (lowerName.startsWith(pattern.split('*')[0].toLowerCase()) && lowerName.endsWith(pattern.split('*')[1]?.toLowerCase() || '')));
}

function isExcluded(filePath) {
    const normalizedPath = filePath.replace(/\\/g, '/');
    return EXCLUDED_PATTERNS.some(pattern => normalizedPath.includes(pattern));
}

async function formatFileToMarkdown(filePath) {
    const relativePath = path.relative(BASE_PATH, filePath).replace(/\\/g, '/');
    let content = '';
    try {
        content = (await fs.readFile(filePath, 'utf-8')).trim();
    } catch (readFileError) {
        console.error(`❌ Fout bij lezen: ${filePath}. Overslaan. Fout: ${readFileError.message}`);
        return "";
    }
    return `--- START OF FILE ${relativePath} ---\n${content}\n--- END OF FILE ---\n\n`;
}

// === SCRIPT UITVOERING ===
(async () => {
    console.log("\n🚀 Script gestart: Scannen van NX config-bestanden...");
    console.log("==================================================================================");
    console.log(`   Basispad: ${BASE_PATH}`);

    try {
        await fs.access(BASE_PATH);
    } catch {
        console.error(`❌ Basispad '${BASE_PATH}' bestaat niet.`);
        process.exit(1);
    }

    console.log("\n   Scannen van hele workspace...");
    let collectedFiles = await getAllConfigFiles(BASE_PATH);

    console.log("\n   Filteren, ontdubbelen en sorteren...");
    const uniqueFiles = [...new Set(collectedFiles)];
    const finalFiles = uniqueFiles.filter(file => !isExcluded(file));
    if (SORT_FILES) {
        finalFiles.sort((a, b) => a.localeCompare(b));
    }

    console.log(`✍️  Totaal ${finalFiles.length} config-bestanden gevonden.`);
    console.log(`   Schrijven naar ${OUTPUT_FILE}...`);

    let markdownOutput = '';
    for (const file of finalFiles) {
        markdownOutput += await formatFileToMarkdown(file);
    }

    try {
        await fs.writeFile(OUTPUT_FILE, markdownOutput, 'utf-8');
        console.log(`\n✅ Succes! Configs geëxporteerd naar: ${path.resolve(OUTPUT_FILE)}`);
    } catch (writeFileError) {
        console.error(`❌ Fout bij schrijven: ${writeFileError.message}`);
    }

    console.log("🏁 Script voltooid!");
})();