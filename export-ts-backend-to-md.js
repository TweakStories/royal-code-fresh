"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs/promises"); // Gebruik fs.promises voor asynchrone bewerkingen
const path = require("path");

// ==================================================================================
// === CONFIGURATIE ===
// ==================================================================================

const OUTPUT_FILE = '_docs/backend.md';
const BACKEND_PROJECT_ROOT_PATH = path.resolve(__dirname, '../../BE/RoyalCode');

const INCLUDED_EXTENSIONS = ['.cs', '.csproj']; // .csproj is nuttig voor een snel overzicht van dependencies.


/**
 * @description
 * Deze lijst bevat de absolute kern van de applicatie die nodig is voor context.
 * We focussen op DI, de DbContext en de entry points.
 */
const MANDATORY_FILES = [
    'src/Application/Application.csproj', // Essentieel voor een overzicht van dependencies
    'src/Application/DependencyInjection.cs',
    'src/Domain/Domain.csproj',
    'src/Infrastructure/Infrastructure.csproj',
    'src/Infrastructure/Data/ApplicationDbContext.cs',
    'src/Infrastructure/DependencyInjection.cs',
    'src/Web/Web.csproj',
    'src/Web/DependencyInjection.cs',
    'src/Infrastructure/Data/ApplicationDbContextInitialiser.cs'
];

/**
 * @description
 * We scannen nu heel specifiek. We nemen de HELE Application en Domain laag,
 * maar alleen de Endpoints van Web en de Identity-modellen van Infrastructure.
 * Dit is de meest efficiënte balans tussen context en token-grootte.
 */
const DIRECTORIES_TO_SCAN = [
    'src/Domain/Entities',
    'src/Domain/Enums',
    'src/Domain/Events',
    'src/Domain/Exceptions',
    'src/Domain/Extensions',
    'src/Application', // De volledige Application-laag is cruciaal
    'src/Web/Endpoints',
    'src/Infrastructure/Identity' // Alleen de user modellen, niet de hele service implementatie
];

/**
 * @description
 * Agressieve uitsluitingslijst. We verwijderen alles wat boilerplate is of
 * te gedetailleerde implementatie bevat.
 */
const EXCLUDED_PATTERNS = [
    'node_modules', 'bin/', 'obj/', 'tests/', '.vs/', '.github/',
    'src/Infrastructure/Data/Migrations/',
    'src/Infrastructure/Data/Configurations/', // BELANGRIJKE UITSLUITING
    'src/Infrastructure/Data/Interceptors/',   // BELANGRIJKE UITSLUITING
    'src/Infrastructure/Services/',            // BELANGRIJKE UITSLUITING (interfaces in Application zijn genoeg)
    'src/Application/Common/Behaviours/',      // BELANGRIJKE UITSLUITING
    'TodoItems', 'TodoLists', 'WeatherForecasts', // Template code
    'Program.cs', 'appsettings.json', '.http', 'CustomExceptionHandler.cs',
    '/GlobalUsings.cs' // Weglaten, voegt alleen ruis toe
];


/** @const {boolean} SORT_FILES Sorteer de uiteindelijke bestandslijst alfabetisch. */
const SORT_FILES = true;

/** @const {boolean} ADD_AI_HEADERS Voeg optionele AI-headers toe (default false voor simplicity). */
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
        // Hier waarschuwen we als een gescande map niet bestaat, in plaats van te crashen.
        console.warn(`     ⚠️ Map om te scannen niet gevonden of error: ${path.relative(BACKEND_PROJECT_ROOT_PATH, dirPath)}. Overslaan. Fout: ${err.message}`);
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
    let relativePath;
    // Speciale handling voor README_SHORT.md als deze buiten de backend-root ligt
    if (filePath.endsWith('README_SHORT.md') && path.dirname(filePath) === __dirname) {
        relativePath = path.relative(__dirname, filePath).replace(/\\/g, '/');
    } else {
        relativePath = path.relative(BACKEND_PROJECT_ROOT_PATH, filePath).replace(/\\/g, '/');
    }

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
    console.log("\n🚀 Script gestart: Dynamisch scannen van .NET backend project...");
    console.log("==================================================================================");
    console.log(`   Backend project basispad ingesteld op: ${BACKEND_PROJECT_ROOT_PATH}`);

    // Valideer het ingestelde backend-pad direct aan het begin
    try {
        await fs.access(BACKEND_PROJECT_ROOT_PATH);
    } catch {
        console.error(`\n❌ KRITIEKE FOUT: Het geconfigureerde basispad '${BACKEND_PROJECT_ROOT_PATH}' voor de backend-code bestaat niet.`);
        console.error(`   Controleer en corrigeer de 'BACKEND_PROJECT_ROOT_PATH' variabele in het script.`);
        process.exit(1);
    }

    let collectedFiles = [];

    // Stap 1: Voeg de essentiële, verplichte bestanden toe
    console.log("\n   [1/3] Verzamelen van kernbestanden...");
    for (const mandatoryFile of MANDATORY_FILES) {
        const isReadmeShort = mandatoryFile === 'README_SHORT.md';
        let absolutePath;

        if (isReadmeShort) {
            // README_SHORT.md wordt altijd vanuit de scriptmap (frontend-root) gehaald
            absolutePath = path.resolve(__dirname, mandatoryFile);
        } else {
            // Andere verplichte bestanden worden vanuit de gedefinieerde backend-root gehaald
            absolutePath = path.resolve(BACKEND_PROJECT_ROOT_PATH, mandatoryFile);
        }

        try {
            await fs.access(absolutePath);
            if (!isExcluded(absolutePath)) {
                collectedFiles.push(absolutePath);
                console.log(`     ✅ Toegevoegd: ${mandatoryFile}`);
            }
        } catch (err) {
            console.warn(`     ⚠️ Kernbestand niet gevonden: ${mandatoryFile}. Overslaan. Fout: ${err.message}`);
        }
    }

    // Stap 2: Scan de opgegeven mappen dynamisch
    console.log("\n   [2/3] Scannen van feature-mappen...");
    for (const dirToScan of DIRECTORIES_TO_SCAN) {
        const absolutePath = path.resolve(BACKEND_PROJECT_ROOT_PATH, dirToScan);
        const filesInDir = await getAllFiles(absolutePath);
        collectedFiles = collectedFiles.concat(filesInDir);
        console.log(`     🔍 Gescand: ${dirToScan} (${filesInDir.length} bestanden gevonden)`);
    }

    // Stap 3: Filter, ontdubbel en sorteer de lijst
    console.log("\n   [3/3] Filteren, ontdubbelen en sorteren van bestanden...");
    const uniqueFiles = [...new Set(collectedFiles)];
    const finalFiles = uniqueFiles.filter(file => !isExcluded(file));
    if (SORT_FILES) {
        finalFiles.sort((a, b) => a.localeCompare(b));
    }

    console.log("----------------------------------------------------------------------------------");
    console.log(`✍️  Totaal ${finalFiles.length} relevante bestanden gevonden.`);
    console.log(`   Bezig met formatteren naar Markdown en schrijven naar ${OUTPUT_FILE}...`);

    let markdownOutput = '';
    for (const file of finalFiles) {
        markdownOutput += await formatFileToMarkdown(file);
    }

    try {
        const outputScriptPath = path.resolve(__dirname, OUTPUT_FILE);
        await fs.writeFile(outputScriptPath, markdownOutput, 'utf-8');
        console.log(`\n✅ Succes! Backend code geëxporteerd naar: ${outputScriptPath}`);
    } catch (writeFileError) {
        console.error(`\n❌ Kritieke fout bij het schrijven naar ${OUTPUT_FILE}: ${writeFileError.message}`);
    }

    console.log("==================================================================================");
    console.log("🏁 Script voltooid!");
})();
