/**
 * @file generate-context-file.js
 * @Version 7.0.0 (Ultra-Focused Checkout Bug Context)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-06
 * @Description
 *   Een script om een uiterst gefocust context-bestand te genereren voor AI-assistenten.
 *   Bevat alleen de *coderelatieven* bestanden die direct nodig zijn om de bugs in de
 *   checkout-flow op te lossen, met minimale tokens en maximale relevantie.
 */

const fs = require("fs/promises");
const path = require("path");

// ==================================================================================
// === CONFIGURATIE ===
// ==================================================================================

const OUTPUT_FILE = '_docs/filter-fix.md';

// ==================================================================================
// === CONFIGURATIE VOOR PRODUCT EDIT MAPPING BUG ===
// ==================================================================================

const FILES_TO_EXTRACT = [
    // ==============================================================================
    // === DE KERN VAN HET PROBLEEM: DE DATA TRANSFORMATIE & CONSUMPTIE
    // ==============================================================================
    
    // 1. De UI Component met de formulierlogica.
    // Dit is de eindbestemming van de data. De `patchFormForEdit` methode hierin is cruciaal,
    // omdat de bug ofwel in de inkomende data zit, of in hoe deze methode de data verwerkt.
    'apps/admin-panel/src/app/components/product-form/product-form.component.ts',

    // 2. De Mapping Service (door u geïdentificeerd als de hoofdverdachte).
    // Deze service vertaalt de ruwe data van de backend naar het model dat de UI gebruikt.
    // Fouten hier hebben directe gevolgen voor het formulier.
    'libs/features/products/core/src/lib/mappers/product-mapping.service.ts',

    // ==============================================================================
    // === DE BRON & BESTEMMING CONTRACTEN (INPUT & OUTPUT VAN DE MAPPER)
    // ==============================================================================

    // 3. Het Backend DTO Contract (Input voor de Mapper).
    // Dit definieert de exacte structuur van de data die van de API komt, inclusief alle
    // geneste objecten voor varianten, media, attributen etc. Zonder dit bestand
    // is de logica van de mapper niet te valideren.
    'libs/features/products/core/src/lib/DTO/backend.types.ts',

    // 4. De Frontend Domain Modellen (Output van de Mapper).
    // Deze bestanden definiëren de "ideale" datastructuur die in de NgRx state wordt opgeslagen
    // en aan de formuliercomponent wordt doorgegeven. Een discrepantie tussen de mapper-output
    // en deze modellen kan de oorzaak zijn.
    'libs/features/products/domain/src/lib/models/product.model.ts',
    'libs/features/products/domain/src/lib/models/product-base.model.ts',
    'libs/features/products/domain/src/lib/models/product-physical.model.ts',
    'libs/features/products/domain/src/lib/models/product-variants.model.ts',

    // ==============================================================================
    // === DE STATE MANAGEMENT & DATAFLOW ORCHESTRATIE
    // ==============================================================================

    // 5. De "Smart" Container Component.
    // Deze component haalt de data op via de facade en geeft deze door aan de `product-form`.
    // Het is de lijm tussen de state en de UI.
    'apps/admin-panel/src/app/pages/product-edit-page/product-edit-page.component.ts',
    
    // 6. De NgRx Effecten.
    // Dit bestand laat zien hoe de API-call wordt getriggerd, hoe de mapping service wordt aangeroepen,
    // en welke actie wordt gedispatched na een succesvolle data-fetch.
    // 'libs/features/admin-products/core/src/lib/state/admin-products.effects.ts',
    
    // 7. De NgRx Feature (Reducer & Selectors).
    // Definieert hoe de gemapte productdata in de state wordt opgeslagen (upsert) en
    // hoe de `selectedProduct` selector wordt opgebouwd.
    // 'libs/features/admin-products/core/src/lib/state/admin-products.feature.ts',

    // 8. De API Service.
    // Toont de exacte API-endpoint die wordt aangeroepen (`getProductById`) en bevestigt dat
    // er geen onverwachte datamanipulatie plaatsvindt vóór de mapper.
    // 'libs/features/admin-products/data-access/src/lib/admin-product-api.service.ts',

    // 9. De Facade.
    // Biedt context over de publieke API van de state die de `product-edit-page` gebruikt.
    // 'libs/features/admin-products/core/src/lib/state/admin-products.facade.ts',
];

const FILES_TO_EXTRACTtt = [
    // ==============================================================================
    // === DE KERN VAN HET PROBLEEM: DE OVERLAY ARCHITECTUUR
    // ==============================================================================
    
    // De service die de overlay creëert en configureert. Dit is het startpunt.
    'libs/ui/overlay/src/lib/dynamic-overlay.service.ts',
    
    // De configuratie-interface en DI tokens. Essentieel voor het begrijpen van de service.
    'libs/ui/overlay/src/lib/dynamic-overlay.tokens.ts',
    
    // De container-component die de content host. De interactie tussen deze component
    // en de `cdk-overlay-pane` is de meest waarschijnlijke locatie van de bug.
    'libs/ui/overlay/src/lib/dynamic-overlay-container.component.ts',

    // ==============================================================================
    // === EEN CONCREET VOORBEELD VAN CONTENT DIE TRANSPARANT IS
    // ==============================================================================

    // De TypeScript-klasse van de component die wordt geopend.
    'libs/ui/forms/src/lib/components/address-form/address-form.component.ts',
    
    // ==============================================================================
    // === DE STYLING ENGINE EN GLOBALE CONFIGURATIE
    // ==============================================================================

    // De bron van alle styling, inclusief de (falende) overlay-regels en CSS variabelen.
    'libs/shared/styles/src/lib/theme.scss',
    
];

const FILES_TO_EXTRACTt = [
    'libs/ui/navigation/src/lib/navigation/navigation-card/navigation-card.component.ts',
    'libs/ui/navigation/src/lib/navigation/category-card/category-card.component.ts',
    'libs/ui/navigation/src/lib/navigation/mega-menu/mega-menu.component.ts',
    'libs/ui/navigation/src/lib/navigation/ui-vertical-nav/ui-vertical-nav.component.ts',
    'libs/ui/navigation/src/lib/navigation/desktop-nav/ui-desktop-nav.component.ts',
    // ==============================================================================
    // === KERN VAN DE APPLICATIE & ROUTING (Bug 1 & Context)
    // ==============================================================================
    'apps/droneshop/src/app/app.routes.ts', // Definieert de hoofdroutes en waar de feature wordt geladen.
    'apps/droneshop/src/app/layout/droneshop-header/droneshop-header.component.ts', // Bevat de navigatie-links die de bug triggeren.

    // ==============================================================================
    // === PRODUCT FEATURE: STATE, LOGICA & DATAFLOW (Cruciaal voor BEIDE bugs)
    // ==============================================================================
    // --- UI & Routing Layer ---
    'libs/features/products/ui-droneshop/src/lib/products-droneshop.routes.ts', // Definieert de lazy-loaded routes en de cruciale resolver.
    'libs/features/products/ui-droneshop/src/lib/resolvers/product-filters.resolver.ts', // **KERN VAN BUG 1**: Hier faalt de state-synchronisatie met de URL.
    'libs/features/products/ui-droneshop/src/lib/pages/shop-page/shop-page.component.ts', // De "smart" component die de state aan de UI koppelt.
    'libs/ui/products/src/lib/filter-sidebar/filter-sidebar.component.ts', // Noodzakelijk om te zien hoe activeFilters wordt gebruikt.

    // --- State Management Layer (NgRx) ---
    'libs/features/products/core/src/lib/state/product.feature.ts', // **KERN VAN BEIDE BUGS**: Bevat de state-definitie en de reducer die de productlijst (onbedoeld) leegmaakt.
    'libs/features/products/core/src/lib/state/product.actions.ts', // Definieert de acties die de state-wijzigingen triggeren.
    'libs/features/products/core/src/lib/state/product.effects.ts', // **KERN VAN BUG 2**: De effecten die onbedoeld een nieuwe laad-cyclus starten.
    'libs/features/products/core/src/lib/state/product.facade.ts', // De interface tussen de UI en de state.

    // --- Data Access & Domain ---
    'libs/features/products/data-access-droneshop/src/lib/services/droneshop-product-api.service.ts', // Hoe de API wordt aangeroepen op basis van de filters.
    'libs/features/products/domain/src/lib/models/product-filters.model.ts', // Het datamodel voor de filters.
    

    // ==============================================================================
    // === CART FEATURE: DE TRIGGER VAN BUG 2
    // ==============================================================================
    'libs/features/cart/core/src/lib/state/cart.effects.ts', // Bevat de `createNewItem$` effect die de `ProductActions.loadProductsByIds` actie verzendt.
    'libs/ui/products/src/lib/product-hero-card/product-hero-card.component.ts', // De component die de "Add to Cart" actie initieert.
];

const SORT_FILES = true;

// ==================================================================================
// === SCRIPT LOGICA (ONGEWIJZIGD) ===
// ==================================================================================

async function formatFileToMarkdown(projectRoot, relativeFilePath) {
    const absolutePath = path.resolve(projectRoot, relativeFilePath);
    const normalizedRelativePath = relativeFilePath.replace(/\\/g, '/');
    try {
        await fs.access(absolutePath);
        const content = await fs.readFile(absolutePath, 'utf-8');
        return `--- START OF FILE ${normalizedRelativePath} ---\n\n${content.trim()}\n\n--- END OF FILE ---\n\n`;
    } catch (error) {
        return "";
    }
}

async function main() {
    console.log("\n🚀 Script gestart: Bestanden verzamelen voor AI-context (Checkout Bugfix, Minimaal)...");
    console.log("==================================================================================");

    const projectRoot = path.resolve('.');
    let fileList = [...FILES_TO_EXTRACT];

    if (SORT_FILES) {
        fileList.sort((a, b) => a.localeCompare(b));
    }
    
    console.log(`   Totaal ${fileList.length} bestanden te verwerken.`);
    console.log(`   Schrijven naar: ${OUTPUT_FILE}...`);

    let markdownOutput = '';
    for (const relativePath of fileList) {
        markdownOutput += await formatFileToMarkdown(projectRoot, relativePath);
    }
    
    const outputDir = path.dirname(OUTPUT_FILE);
    try {
        await fs.mkdir(outputDir, { recursive: true });
        await fs.writeFile(OUTPUT_FILE, markdownOutput.trim(), 'utf-8');
        console.log(`\n✅ Succes! Contextbestand geëxporteerd naar: ${path.resolve(OUTPUT_FILE)}`);
    } catch (error) {
        console.error(`\n❌ Kritieke fout: ${error.message}`);
        process.exit(1);
    }

    console.log("==================================================================================");
    console.log("🏁 Script voltooid!");
}

main().catch(error => {
    console.error("\n❌ Een onverwachte fout is opgetreden:", error);
    process.exit(1);
});