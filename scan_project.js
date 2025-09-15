"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs/promises");
const path = require("path"); // BELANGRIJKE FIX: path module import

// ==================================================================================
// === CONFIGURATIE ===
// ==================================================================================

const OUTPUT_FILE = 'frontend-code.md';
const BASE_PATH = path.resolve('.');

/**
 * @const {string[]} INCLUDED_EXTENSIONS
 * @description Alleen bestanden met deze extensies worden meegenomen in de scan.
 */
const INCLUDED_EXTENSIONS = ['.ts', '.json']; // .json is nodig voor tsconfig en project.json

/**
 * @const {string[]} DIRECTORIES_TO_SCAN
 * @description Gerichte scan op de betrokken domain libraries
 */
const DIRECTORIES_TO_SCAN = [
  'libs/features', // Focus nu op de features
  'libs/shared',
  'libs/core'
];


/**
 * @const {string[]} MANDATORY_FILES
 * @description Voeg alle relevante project.json en tsconfig.json bestanden toe
 *              die de afhankelijkheidsgraaf bepalen.
 */
const MANDATORY_FILES = [
  // Project.json files (waarschijnlijk al in de vorige scan)
  'libs/shared/domain/project.json',
  'libs/shared/base-models/project.json',
  'libs/features/social/domain/project.json',
  'libs/features/media/domain/project.json',
  'libs/features/reviews/domain/project.json',

  // TSConfig files - DEZE ZIJN KRITIEK EN MOETEN HIERBIJ!
  'libs/shared/domain/tsconfig.json',
  'libs/shared/domain/tsconfig.lib.json',
  'libs/shared/domain/tsconfig.lib.prod.json', // Voeg deze ook toe voor volledigheid
  'libs/shared/base-models/tsconfig.json',
  'libs/shared/base-models/tsconfig.lib.json',
  'libs/shared/base-models/tsconfig.lib.prod.json',
  'libs/features/social/domain/tsconfig.json',
  'libs/features/social/domain/tsconfig.lib.json',
  'libs/features/social/domain/tsconfig.lib.prod.json',
  'libs/features/media/domain/tsconfig.json',
  'libs/features/media/domain/tsconfig.lib.json',
  'libs/features/media/domain/tsconfig.lib.prod.json',
  'libs/features/reviews/domain/tsconfig.json',
  'libs/features/reviews/domain/tsconfig.lib.json',
  'libs/features/reviews/domain/tsconfig.lib.prod.json',

  // Algemene project tsconfig die kan overerven
  'tsconfig.base.json'
];

/**
 * @const {string[]} EXCLUDED_PATTERNS
 * @description Paden en patronen die altijd moeten worden uitgesloten.
 */
const EXCLUDED_PATTERNS = [
  'node_modules',
  '.spec.ts',
  '.test.ts',
  '.mock.ts',
  'jest.config.ts',
  'karma.conf.js',
  'test-setup.ts',
  'polyfills.ts',
  '/dist/',
  '/.nx/',
  '/coverage/',
  '/.angular/',
  '/.vscode/',
  '/.idea/',
  '/src/assets/',
  '/src/environments/',
  // Exclude alle UI componenten en data-access in dit stadium, we focussen op de domain modellen
  '/ui/',
  '/data-access/',
  '/util/', // Om bijvoorbeeld libs/core/navigation/src/lib/util/util.component.ts uit te sluiten
  'libs/ui',
];

/**
 * @const {boolean} SORT_FILES
 * @description Sorteer de uiteindelijke bestandslijst alfabetisch voor een consistente output.
 */
const SORT_FILES = true;

/**
 * @const {boolean} ADD_AI_HEADERS
 * @description Voeg optionele AI-headers toe voor betere context (default false voor simplicity).
 */
const ADD_AI_HEADERS = false;

// === HULPFUNCTIES ===

async function getAllFiles(dirPath) {
    let files = [];
    try {
        const items = await fs.readdir(dirPath, { withFileTypes: true });
        for (const item of items) {
            const fullPath = path.join(dirPath, item.name);
            if (isExcluded(fullPath)) continue;

            if (item.isDirectory()) {
                files = files.concat(await getAllFiles(fullPath));
            } else if (INCLUDED_EXTENSIONS.includes(path.extname(item.name).toLowerCase())) {
                files.push(fullPath);
            }
        }
    } catch (err) {
        console.warn(`     ⚠️ Map om te scannen niet gevonden of error: ${path.relative(BASE_PATH, dirPath)}. Overslaan. Error: ${err.message}`);
    }
    return files;
}

function isExcluded(filePath) {
    const normalizedPath = filePath.replace(/\\/g, '/');
    for (const pattern of EXCLUDED_PATTERNS) {
        if (normalizedPath.includes(pattern)) {
            return true;
        }
    }
    return false;
}

async function formatFileToMarkdown(filePath) {
    const relativePath = path.relative(BASE_PATH, filePath).replace(/\\/g, '/');
    let content = '';
    try {
        content = (await fs.readFile(filePath, 'utf-8')).trim();
    } catch (readFileError) {
        console.error(`❌ Fout bij het lezen van bestand: ${filePath}. Overslaan. Fout: ${readFileError.message}`);
        return "";
    }
    let markdown = `--- START OF FILE ${relativePath} ---\n`;
    if (ADD_AI_HEADERS) {
        markdown += `/**
 * @file ${path.basename(filePath)}
 * @Version 1.0.0 (Auto-Generated Header)
 * @Author User-Script
 * @Date ${new Date().toISOString().split('T')[0]}
 * @Description Auto-geëxporteerd bestand voor AI-analyse.
 */\n\n`;
    }
    markdown += `${content}\n--- END OF FILE ---\n\n`;
    return markdown;
}

// === SCRIPT UITVOERING (ASYNC VOOR PERFORMANCE) ===
(async () => {
    console.log("\n🚀 Script gestart: Dynamisch scannen van Frontend project...");
    console.log("==================================================================================");
    console.log(`   Project basispad ingesteld op: ${BASE_PATH}`);

    try {
        await fs.access(BASE_PATH);
    } catch {
        console.error(`\n❌ KRITIEKE FOUT: Het basispad '${BASE_PATH}' bestaat niet.`);
        process.exit(1);
    }

    let collectedFiles = [];

    // Stap 1: Scan de opgegeven mappen dynamisch (nu async)
    console.log("\n   [1/3] Scannen van feature-mappen...");
    for (const dirToScan of DIRECTORIES_TO_SCAN) {
        const absolutePath = path.resolve(BASE_PATH, dirToScan);
        const filesInDir = await getAllFiles(absolutePath);
        collectedFiles = collectedFiles.concat(filesInDir);
        console.log(`     🔍 Gescand: ${dirToScan} (${filesInDir.length} bestanden gevonden)`);
    }

    // Stap 2: Voeg de verplichte, losstaande bestanden toe
    console.log("\n   [2/3] Toevoegen van verplichte bestanden...");
    for (const mandatoryFile of MANDATORY_FILES) {
        const absolutePath = path.resolve(BASE_PATH, mandatoryFile);
        try {
            await fs.access(absolutePath);
            if (!isExcluded(absolutePath)) {
                collectedFiles.push(absolutePath);
                console.log(`     ✅ Toegevoegd: ${mandatoryFile}`);
            }
        } catch {
            console.warn(`     ⚠️ Verplicht bestand niet gevonden: ${mandatoryFile}`);
        }
    }

    // Stap 3: Filter, ontdubbel en sorteer de lijst
    console.log("\n   [3/3] Filteren, ontdubbelen en sorteren van bestanden...");
    const uniqueFiles = [...new Set(collectedFiles)];
    const finalFiles = uniqueFiles.filter(file => !isExcluded(file)); // Dubbele check
    if (SORT_FILES) {
        finalFiles.sort((a, b) => a.localeCompare(b));
    }

    console.log("----------------------------------------------------------------------------------");
    console.log(`✍️  Totaal ${finalFiles.length} relevante bestanden gevonden.`);
    console.log(`   Bezig met formatteren en schrijven naar ${OUTPUT_FILE}...`);

    let markdownOutput = '';
    for (const file of finalFiles) {
        markdownOutput += await formatFileToMarkdown(file);
    }

    try {
        const outputScriptPath = path.resolve(__dirname, OUTPUT_FILE);
        await fs.writeFile(outputScriptPath, markdownOutput, 'utf-8');
        console.log(`\n✅ Succes! Frontend code geëxporteerd naar: ${outputScriptPath}`);
    } catch (writeFileError) {
        console.error(`\n❌ Kritieke fout bij het schrijven naar ${OUTPUT_FILE}: ${writeFileError.message}`);
    }

    console.log("==================================================================================");
    console.log("🏁 Script voltooid!");
})();