// export-ts-definitions-to-md.js

const fs = require('node:fs');
const path = require('node:path');

// --- Configuratie ---
const OUTPUT_FILENAME = 'frontend-definitions.md'; // Aangepaste, meer algemene naam

// NIEUW: Flexibele patronen voor het vinden van bestanden
const INCLUDED_FILE_PATTERNS = [   // Bestanden die eindigen op een van deze patronen worden meegenomen
    '.model.ts',
    '.type.ts',
    '.dto.ts', // Vaak gebruikt voor Data Transfer Objects
    // Voeg '.ts' toe als je ALLE TypeScript-bestanden wilt overwegen (zie EXCLUDED hieronder)
    // '.ts',
];

const EXCLUDED_FILE_PATTERNS = [   // Bestanden die eindigen op een van deze patronen worden ALTIJD overgeslagen
    '.spec.ts',                      // Unit tests (Jasmine/Jest)
    '.test.ts',                      // Unit tests (Jest)
    '.component.ts',                 // Angular components
    '.service.ts',                   // Angular services
    '.pipe.ts',                      // Angular pipes
    '.directive.ts',                 // Angular directives
    '.guard.ts',                     // Angular guards
    '.module.ts',                    // Angular modules
    '.story.ts',                     // Storybook stories
    '.stories.ts',                   // Storybook stories
];

const INCLUDED_ROOT_FOLDERS = ['.']; // Start in de huidige werkdirectory (project root)
const EXCLUDED_FOLDERS = [         // Mappen die volledig overgeslagen moeten worden
    'node_modules',
    '.git',
    '.github',
    '.husky',
    '.nx',
    '.vscode',
    '.angular',
    'dist',
    'tmp',
    'coverage',
    'cypress',
    'e2e',
    'apps',
    // Voeg hier eventuele andere mappen toe die je wilt uitsluiten
];
const MARKDOWN_HEADER = '# TypeScript Definities (Frontend)\n\n'; // Aangepaste titel
const SCRIPT_START_MESSAGE = `🔎 Script gestart: Scannen naar bestanden die voldoen aan de patronen: [${INCLUDED_FILE_PATTERNS.join(', ')}]...`;
const SCRIPT_NO_FILES_MESSAGE = '🤷 Geen bestanden gevonden die voldoen aan de criteria.';
const SCRIPT_SUCCESS_MESSAGE_TEMPLATE = (count, filename) =>
    `✅ Succes! ${count} bestand(en) geëxporteerd naar ${filename}`;
const SCRIPT_ERROR_MESSAGE = '❌ Er is een fout opgetreden:';

// --- Hulpfuncties ---

/**
 * Recursief zoeken naar bestanden op basis van inclusie- en exclusiepatronen.
 * @param {string} currentPath Het huidige pad om te scannen.
 * @param {string[]} filesList Een array om de gevonden bestandspaden in te verzamelen.
 * @returns {string[]} Een array met de volledige paden naar de gevonden bestanden.
 */
function findFilesRecursive(currentPath, filesList = []) {
    try {
        const items = fs.readdirSync(currentPath);

        for (const item of items) {
            const itemPath = path.join(currentPath, item);

            if (EXCLUDED_FOLDERS.includes(item)) {
                continue;
            }

            let stat;
            try {
                stat = fs.statSync(itemPath);
            } catch (statError) {
                // console.warn(`    ⚠️ Kon stat niet lezen voor ${itemPath}, wordt overgeslagen.`);
                continue;
            }


            if (stat.isDirectory()) {
                if (EXCLUDED_FOLDERS.includes(path.basename(itemPath))) {
                    continue;
                }
                findFilesRecursive(itemPath, filesList);
            } else if (stat.isFile()) {
                // AANGEPAST: Logica om bestanden te matchen
                const isIncluded = INCLUDED_FILE_PATTERNS.some(pattern => item.endsWith(pattern));
                const isExcluded = EXCLUDED_FILE_PATTERNS.some(pattern => item.endsWith(pattern));

                if (isIncluded && !isExcluded) {
                    filesList.push(itemPath);
                }
            }
        }
    } catch (error) {
        // console.warn(`    ⚠️ Kon map niet lezen: ${currentPath}. Fout: ${error.message}`);
    }
    return filesList;
}

// --- Hoofdlogica ---

function main() {
    console.log(SCRIPT_START_MESSAGE);

    const allFoundFiles = [];
    for (const rootFolder of INCLUDED_ROOT_FOLDERS) {
        const rootPath = path.resolve(process.cwd(), rootFolder);
        console.log(`🔍 Scannen in root: ${rootPath}`);
        findFilesRecursive(rootPath, allFoundFiles); // AANGEPAST: Roept de vernieuwde functie aan
    }

    if (allFoundFiles.length === 0) {
        console.log(SCRIPT_NO_FILES_MESSAGE);
        return;
    }

    console.log(`📄 ${allFoundFiles.length} bestand(en) gevonden. Bezig met genereren van Markdown...`);

    let markdownContent = MARKDOWN_HEADER;

    // Deze logica is onveranderd gebleven
    for (const filePath of allFoundFiles) {
        try {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const relativeFilePath = path.relative(process.cwd(), filePath).replace(/\\/g, '/');

            markdownContent += `## ${relativeFilePath}\n\n`;
            markdownContent += '```typescript\n';
            markdownContent += fileContent.trim() + '\n';
            markdownContent += '```\n\n';
        } catch (readError) {
            console.warn(`    ⚠️ Kon bestand niet lezen: ${filePath}. Fout: ${readError.message}`);
            markdownContent += `## ${path.relative(process.cwd(), filePath).replace(/\\/g, '/')}\n\n`;
            markdownContent += `\`\`\`\nError: Kon dit bestand niet lezen.\n${readError.message}\n\`\`\`\n\n`;
        }
    }

    try {
        fs.writeFileSync(OUTPUT_FILENAME, markdownContent);
        console.log(SCRIPT_SUCCESS_MESSAGE_TEMPLATE(allFoundFiles.length, OUTPUT_FILENAME));
    } catch (writeError) {
        console.error(`${SCRIPT_ERROR_MESSAGE} Kon ${OUTPUT_FILENAME} niet schrijven.`, writeError);
    }
}

// --- Script uitvoeren ---
try {
    main();
} catch (error) {
    console.error(SCRIPT_ERROR_MESSAGE, error);
    process.exit(1);
}
