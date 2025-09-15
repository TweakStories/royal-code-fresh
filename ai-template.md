**Herzien "Conversatie Starter Template" (Generiek):**

```markdown
# Conversatie Starter Template: [Onderwerp/Feature van deze sessie]

**Datum:** [Datum invullen]

**(Instructies:**
*   Vul deze template in aan het begin van een nieuwe ontwikkelingssessie of als we aan een nieuw (sub-)onderdeel beginnen.
*   **DEEL A (Context):** Controleer/update deze projectbrede informatie indien nodig.
*   **DEEL B (Sessie Focus):** Vul deze secties specifiek voor **deze sessie** in. Wees zo duidelijk mogelijk.
*   **Feature Breakdown (Sectie 6):** Gebruik de hiërarchische checklist (`- [ ]`/`- [x]`) om de taken voor de *huidige feature* op te splitsen en de voortgang bij te houden. Markeer het specifieke onderdeel waar we ons **nu** op focussen met bv. **`<-- HIER`**.
*   **AI Richtlijnen:** Lees deze door om te weten hoe ik (de AI) zal proberen te reageren.
)**

---

## DEEL A: Project Context & Technische Basis (Herbruikbaar / Bijwerken indien nodig)

### 1. Project Context:
*   **Applicatie Naam:** `[Naam van jouw applicatie]`
*   **Korte Beschrijving:** `[Korte beschrijving van de applicatie en het doel]`
*   **Huidige Algemene Status:** `[bv. In actieve ontwikkeling, Planningfase, Refactoring]`

### 2. Technologie Stack:
*   **Frontend Framework:** `[bv. Angular (vX.Y - Standalone, Signals)]`
*   **Monorepo:** `[bv. Nx (vX.Y)]` (Indien van toepassing)
*   **State Management:** `[bv. NgRx (Globale State + Feature State)]` (Indien van toepassing)
*   **Styling:** `[bv. TailwindCSS, SCSS Modules, CSS Variabelen]`
*   **UI Component Library:** `[bv. Eigen library (@scope/ui), Angular Material, PrimeNG]`
*   **Backend:** `[bv. ASP.NET Core, Node.js/Express, etc.]` (Relevant voor API interactie)
*   **Internationalisatie:** `[bv. @ngx-translate/core]` (Indien van toepassing)
*   **(Optioneel) Belangrijke Libraries:** `[bv. date-fns, Leaflet, Chart.js, CDK]`

### 3. Architectuur Overview (Project-Breed):
*   **Monorepo Structuur:** `[bv. Nx workspace (apps/..., libs/...), Lerna, etc.]`
*   **Library Categorieën:** `[bv. core, features/[domain], shared, ui, [domain]/data-access, utils]`
*   **Belangrijkste Patronen:** `[bv. Facade Pattern, Standalone Components, Signals, Smart/Dumb Components, Dependency Injection]`
*   **State Management Aanpak:** `[bv. Globale state voor X, Y, Z. Feature state per domein. Signaal-gebaseerde state in componenten.]`

### 4. Core Features & Cross-Cutting Concerns (Status):
    *(Optioneel: Houd hier bij welke basis-elementen al werken)*
    *   `[ ] Authenticatie`
    *   `[ ] Routing`
    *   `[ ] Globale State Basis`
    *   `[ ] Theming`
    *   `[ ] Internationalisatie (i18n)`
    *   `[ ] Basis UI Componenten`
    *   `[ ] Logging`
    *   `[ ] Basis HTTP setup`
    *   `[ ] Basis Error Handling`
    *   `[ ] User State/Service Basis`

---

## DEEL B: Focus voor Deze Sessie (Specifiek invullen)

### 5. Feature / Area of Focus voor DEZE Sessie:
*   **Feature Naam:** `[ Vul hier de overkoepelende feature naam in (bv. Social Feed, Node Detail Page) ]`
*   **Relevant(e) Bestand(en) (initieel):** `[ Pad(en) naar de bestanden waar we waarschijnlijk aan gaan werken ]`

### 6. Feature Breakdown & Status (Hiërarchische Checklist):
    * *(Instructie: Maak hier je gedetailleerde, geneste plan voor de *huidige feature*. Splits het op in logische onderdelen (pagina's, componenten, services, state, etc.) en taken. Gebruik `- [ ]` (to do) of `- [x]` (done) voor status. Markeer de **huidige focus** met bv. **`<-- HIER**.)*

    * **VOORBEELD (Node Detail Feature):**
        * `- [ ] Feature: Node Detail Weergave & Interactie (\`libs/features/nodes\`)`
            * `- [ ] Pagina: Node Detail Pagina (\`libs/features/nodes/pages/node-detail-page.component.ts\`)`
                * `- [ ] Routing: Route opzetten met \`:nodeId\` parameter.`
                * `- [ ] Laden van Node Details (via NodeFacade).`
                * `- [ ] Weergave Node Informatie Sectie (\`NodeInfoComponent\`).`
                * `- [ ] Weergave Afbeeldingen Sectie (\`NodeMediaGalleryComponent\`).`
                * `- [ ] Weergave Social Feed Sectie (\`NodeFeedComponent\` - zie aparte feature breakdown).`
                * `- [ ] Weergave "Start Challenge" Knop (conditioneel).`
            * `- [ ] Component: Node Informatie Weergave (\`libs/nodes/ui/node-info.component.ts\`)`
                * `- [ ] Input: \`Node\``
                * `- [ ] Weergave: Titel, Type, Beschrijving, Locatie (mini-map?), Creator.`
            * `- [ ] Component: Node Media Galerij (\`libs/nodes/ui/node-media-gallery.component.ts\`)`
                * `- [ ] Input: \`mediaItems: Media[]\``
                * `- [ ] Layout: Grid/Carousel weergave.`
                * `- [ ] Interactie: Klik opent lightbox/viewer.` **<-- HIER**
            * `- [ ] Component: Node Social Feed (Zie Feature Breakdown: Social Feed)`
            * `- [ ] State: Node Detail State Management (Indien nodig, bv. voor lokale UI state)`
            * `- [ ] Service: Interactie met NodeFacade/MapFacade.`

### 7. Doel / Taak voor DEZE Sessie:
*   `[ Formuleer hier het specifieke, concrete doel. Bv: "Implementeer de klik-interactie op NodeMediaGalleryComponent zodat de lightbox opent met de geselecteerde afbeelding." Verwijs naar de taak in sectie 6. ]`

### 9. Gewenste Uitkomst / Specifieke Vragen:
*   `[ Wat wil je bereiken met dit gesprek? Welke vragen heb je aan mij? bv. "Geef werkende code voor de klik-handler en de service call.", "Advies over de beste manier om de overlay te openen.", "Waarom werkt mijn huidige code niet?", "Controleer deze code op best practices." ]`

---

**(AI Richtlijnen - Voor Gemini):**
*   **Context:** Gebruik DEEL A en DEEL B (vooral secties 5, 6, 7, 8) om de huidige taak te begrijpen.
*   **Focus:** Concentreer je op de taak gemarkeerd met `<-- HIER` in sectie 6 en het doel in sectie 7.
*   **Behoud Bestaande Features:** Verwijder niet zomaar elementen/functionaliteit. Bespreek impact van refactoring.
*   **Proactieve Suggesties:** Wijs me op verbeteringen (errors, i18n, performance, architectuur, state, accessibility, logica etc.).
*   **Beknopte Code Wijzigingen:** Geef primair alleen gewijzigde codeblokken.
*   **Drempels voor Volledige Code:** Hele functie/methode (> 5 lijnen significant gewijzigd). Hele component/class (> 15 lijnen significant gewijzigd, tenzij extreem groot). Gebruik dit als richtlijn.
*   **Focus op Huidig Bestand:** Geef aan welk(e) bestand(en) we aanpassen.

```

### 8. Relevante Code / Huidige Status:
*   ```typescript
    // Plak hier de *minimale* relevante code snippets die nodig zijn voor de context...
    // bv. de huidige (lege) component class, de interface, de state selector.

    ```
*   `[ Beschrijf kort de huidige situatie: bv. "Component is aangemaakt, maar nog leeg.", "Ik krijg deze error...", "Dit heb ik geprobeerd..." ]`

