"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs/promises");
const path = require("path");

// ==================================================================================
// === CONFIGURATIE ===
// ==================================================================================

const OUTPUT_FILE = '_docs/frontend-code.md';
const BASE_PATH = path.resolve('.'); // Blijft de root van het project.

/**
 * @const {RegExp[]} CONFIG_FILE_PATTERNS
 * @description Een lijst van reguliere expressies. Bestanden die overeenkomen met een van deze
 *              patronen worden ALTIJD meegenomen, ongeacht hun extensie.
 *              De `[\\\/]` zorgt ervoor dat dit werkt op zowel Windows (\) als Linux/Mac (/).
 */
const CONFIG_FILE_PATTERNS = [
    /[\\\/]tsconfig\.base\.json$/,
    /[\\\/]tsconfig.*\.json$/, // Vangt tsconfig.json, tsconfig.app.json, etc.
    /[\\\/]project\.json$/,
    /[\\\/]package\.json$/,
    /[\\\/]ng-package\.json$/,
    /[\\\/]proxy\.conf\.json$/,
];

/**
 * @const {string[]} INCLUDED_CODE_EXTENSIONS
 * @description Alleen bestanden met deze extensies worden als "code" beschouwd.
 *              Configuratiebestanden worden apart gedetecteerd via CONFIG_FILE_PATTERNS.
 */
const INCLUDED_CODE_EXTENSIONS = ['.ts', '.html', '.scss'];

/**
 * @const {string[]} DIRECTORIES_TO_SCAN
 * @description Een lijst van hoog-niveau mappen die volledig gescand moeten worden.
 */
const DIRECTORIES_TO_SCAN = [
      'apps/droneshop',
    //   'apps/cv',
    //   'libs/features',
      'libs/shared',
      'libs/core',
    //   'libs/ui/cards',
    //       'libs/ui/paragraph',
    // 'libs/ui/breadcrumb',
    // 'libs/ui/faq',
    // 'libs/ui/pagination',
    // 'libs/features/social',
    // 'libs/features',



         'libs/ui',
    //   'libs/features/chat',
    //   'libs/features/admin-users',
    //   'libs/features/admin-products',
    //   'libs/features/admin-orders',
    //   'libs/core/core-logging',

    //   'libs/features/products',
    //   'libs/features/products/core',
    //   'libs/features/products/domain',
    //   'libs/features/media',
    //   'libs/features/products/data-access-plushie',
    //   'libs/features/media',

    //   'libs/features/cart',
    //   'libs/features/checkout',
    //   'libs/features/orders',
    //   'libs/features/orders/core',
    //   'libs/features/orders/domain',
    //   'libs/features/orders/data-access-plushie',

    //   'libs/features/authentication',
    //   'libs/features/reviews',
      'libs/store/user',
    //   'libs/store/auth',
    //   'libs/store',
    //   'libs/store/error',
    //   'libs/store/theme',
    //   'libs/users/data-access',
    //   'libs/core',
    //   'libs/shared',
    //   'libs/shared/utils',


    //   'libs/ui',
    // 'libs/ui/button',
    // 'libs/ui/icon',
    // 'libs/ui/media', // Bevat ui-image, ui-media-gallery, etc.
    // 'libs/ui/rating',
    // 'libs/ui/title',
    // 'libs/ui/variant-selector',
    //   'libs/ui/media/src/lib/media-uploader',
    //   'libs/ui/meters',
    //   'libs/ui/overlay',
    //   'libs/ui/forms',
    //   'libs/ui/notifications',
    // 'libs'
];

/**
 * @const {string[]} EXCLUDED_PATTERNS
 * @description Paden en patronen die altijd moeten worden uitgesloten. Cruciaal voor performance.
 */
const EXCLUDED_PATTERNS = [
    'node_modules',
    '.spec.ts',      // Testbestanden
    '.test.ts',      // Testbestanden
    '.mock.ts',      // Mock-bestanden
    'jest.config.ts',
    'test-setup.ts',
    'polyfills.ts',
    '/dist/',
    '/.nx/',
    '/coverage/',
    '/.angular/',
    '/.vscode/',
    '/.idea/',
    '/src/assets/',     // Assets bevatten vaak veel (grote) bestanden die we niet nodig hebben
    '/src/environments/', // Omgevingsspecifieke bestanden zijn meestal niet nodig
    'package-lock.json',
    'project backup ssr.json' // Specifieke bestanden uitsluiten
];

/**
 * @const {boolean} SORT_FILES
 * @description Sorteer de uiteindelijke bestandslijst alfabetisch.
 */
const SORT_FILES = true;

// === HULPFUNCTIES (met aangepaste logica) ===

async function getAllFiles(dirPath) {
    let files = [];
    try {
        const items = await fs.readdir(dirPath, { withFileTypes: true });
        for (const item of items) {
            const fullPath = path.join(dirPath, item.name);
            if (isExcluded(fullPath)) continue;

            if (item.isDirectory()) {
                files = files.concat(await getAllFiles(fullPath));
            } else {
                const normalizedPath = fullPath.replace(/\\/g, '/');

                // CONDITIE 1: Is het een configuratiebestand dat we willen?
                const isConfigFile = CONFIG_FILE_PATTERNS.some(regex => regex.test(normalizedPath));

                // CONDITIE 2: Is het een code-bestand met een toegestane extensie?
                const isIncludedCodeFile = INCLUDED_CODE_EXTENSIONS.includes(path.extname(item.name).toLowerCase());

                if (isConfigFile || isIncludedCodeFile) {
                    files.push(fullPath);
                }
            }
        }
    } catch (err) {
        console.warn(`     ⚠️ Map om te scannen niet gevonden of error: ${path.relative(BASE_PATH, dirPath)}. Overslaan. Error: ${err.message}`);
    }
    return files;
}

function isExcluded(filePath) {
    const normalizedPath = filePath.replace(/\\/g, '/');
    // Uitsluiten als het pad EEN van de patronen bevat
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
    // Voeg extra witruimte toe voor betere scheiding, vooral na codeblokken
    let markdown = `--- START OF FILE ${relativePath} ---\n\n`;
    markdown += `${content}\n\n--- END OF FILE ---\n\n`;
    return markdown;
}


// === SCRIPT UITVOERING ===
(async () => {
    console.log("\n🚀 Script gestart: Automatisch scannen van Frontend project...");
    console.log("==================================================================================");

    let collectedFiles = [];

    // Stap 1: Scan de opgegeven mappen dynamisch
    console.log("\n   [1/2] Scannen van opgegeven mappen...");
    for (const dirToScan of DIRECTORIES_TO_SCAN) {
        const absolutePath = path.resolve(BASE_PATH, dirToScan);
        const filesInDir = await getAllFiles(absolutePath);
        collectedFiles = collectedFiles.concat(filesInDir);
        console.log(`     🔍 Gescand: ${dirToScan} (${filesInDir.length} bestanden gevonden)`);
    }

    // Stap 2: Filter, ontdubbel en sorteer de lijst
    console.log("\n   [2/2] Filteren, ontdubbelen en sorteren van bestanden...");
    const uniqueFiles = [...new Set(collectedFiles)];
    let finalFiles = uniqueFiles.filter(file => !isExcluded(file)); // Dubbele check

    // Zorg ervoor dat tsconfig.base.json altijd als eerste komt voor maximale context
    const tsconfigBaseIndex = finalFiles.findIndex(file => file.endsWith('tsconfig.base.json'));
    if (tsconfigBaseIndex > -1) {
        const [tsconfigBase] = finalFiles.splice(tsconfigBaseIndex, 1);
        finalFiles.unshift(tsconfigBase); // Verplaats naar het begin
    }

    if (SORT_FILES) {
        // Sorteer de rest van de bestanden
        const firstFile = finalFiles.shift(); // Haal tsconfig.base.json eraf
        finalFiles.sort((a, b) => a.localeCompare(b)); // Sorteer de rest
        if (firstFile) finalFiles.unshift(firstFile); // Zet hem weer terug vooraan
    }

    console.log("----------------------------------------------------------------------------------");
    console.log(`✍️  Totaal ${finalFiles.length} relevante bestanden gevonden.`);
    console.log(`   Bezig met formatteren en schrijven naar ${OUTPUT_FILE}...`);

    let markdownOutput = '';
    for (const file of finalFiles) {
        markdownOutput += await formatFileToMarkdown(file);
    }

    try {
        const outputScriptPath = path.resolve(process.cwd(), OUTPUT_FILE);
        await fs.writeFile(outputScriptPath, markdownOutput, 'utf-8');
        console.log(`\n✅ Succes! Frontend code geëxporteerd naar: ${outputScriptPath}`);
    } catch (writeFileError) {
        console.error(`\n❌ Kritieke fout bij het schrijven naar ${OUTPUT_FILE}: ${writeFileError.message}`);
    }

    console.log("==================================================================================");
    console.log("🏁 Script voltooid!");
})();