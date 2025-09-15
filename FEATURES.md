

## Inhoudsopgave
Functionele Features
    * [Feature 3.1: Core Challenge System](#feature-31-core-challenge-system)
    * [Feature 3.2: Node System Foundation](#feature-32-node-system-foundation)
    * [Feature 3.3: Navigation & Tracking](#feature-33-navigation--tracking)
    * [Feature 3.4: Social & Community](#feature-34-social--community)
    * [Feature 3.5: User Profile & Progression](#feature-35-user-profile--progression)
    * [Feature 3.6: Achievements & Leaderboards](#feature-36-achievements--leaderboards)
    * [Feature 3.7: Items, Crafting & Economy](#feature-37-items-crafting--economy)
    * [Feature 3.8: AI Interaction & Personalization](#feature-38-ai-interaction--personalization)
    * [Feature 3.9: Events & Special Activities](#feature-39-events--special-activities)
    * [Feature 3.10: Territory Control & Guild Strategy](#feature-310-territory-control--guild-strategy)
    * [Feature 3.11: Account Management](#feature-311-account-management)
    * [Feature 3.12: Monetization](#feature-312-monetization)
    * [Feature 3.13: System Integrations](#feature-313-system-integrations)
    * [Feature 3.14: Content Moderation & Reporting](#feature-314-content-moderation--reporting)
    * [Feature 3.15: Support, Feedback & Onboarding](#feature-315-support-feedback--onboarding)
    * [Feature 3.16: System Wide](#feature-316-system-wide)
    * [Feature 3.17: Pets & Virtual Companions](#feature-317-pets--virtual-companions)

## 1. Inleiding

*   **Applicatie Beschrijving & Visie:**
    De Challenger App is een ambitieuze mobiele applicatie ontworpen om gebruikers te inspireren en te motiveren tot persoonlijke groei op fysiek, mentaal en sociaal vlak. Het transformeert het dagelijks leven in een **"Real Life MMO"**, waarin gebruikers niet alleen uitdagingen aangaan, maar ook hun **eigen digitale avatar ontwikkelen en versterken**. De kernvisie is het creëren van een levendig, gamified ecosysteem waarin gebruikers individuele doelen nastreven, hun personage zien groeien, en deel uitmaken van een actieve en ondersteunende community.

*   **Kernconcepten & Differentiators:**
    De app onderscheidt zich door de diepe integratie van verschillende sleutelconcepten:
    *   **Uitgebreid Challenge Systeem:** Het hart van de app, waar gebruikers een breed scala aan uitdagingen kunnen ontdekken, zelf creëren, en aangaan – van korte fysieke sprints tot langdurige mentale projecten en samenwerkingsmissies. Het voltooien van deze challenges is de primaire manier om te groeien.
    *   **Diepgaande Gamification & Progressie:** Motivatie wordt continu gestimuleerd. Gebruikers verdienen **XP** met het voltooien van challenges en mogelijk ook direct door **geregistreerde fysieke activiteit** (bv. stappen, afstand via wearables). Met XP levelen ze hun **eigen in-game avatar**. Hogere levels en specifieke skills (via **skill trees**) ontgrendelen nieuwe mogelijkheden. Verzamelde of gecrafte **items en uitrusting** kunnen de avatar **statistieken en bonussen** geven, wat de MMO-ervaring versterkt. Dit wordt aangevuld met badges, leaderboards, loot boxes, crafting, streaks en seizoensevents.
    *   **Data-Driven Inzichten & Integratie:** Gedetailleerde statistieken bieden gebruikers inzicht in hun prestaties en voortgang. Door **integratie met wearables en health platforms** (bv. Apple Health, Google Fit) wordt niet alleen data zoals hartslag en slaap inzichtelijk gemaakt, maar kan deze data ook bijdragen aan de game-ervaring en progressie. AI-voorspellingen en alerts kunnen gebruikers verder ondersteunen.
    *   **Interactieve Navigatie & AR:** Fysieke uitdagingen worden verrijkt met interactieve routeplanning, een innovatief node-gebaseerd systeem voor waypoints, Augmented Reality (AR) checkpoints en pathways, en diverse navigatiehulpmiddelen (kaart, kompas, audio). Dit omvat ook strategische elementen zoals 'Territory Control'.
    *   **AI-Gedreven Begeleiding:** Naast de progressie van de gebruikersavatar, kan een optionele AI-component fungeren als virtuele compagnon of coach die real-time feedback, gepersonaliseerde tips, adaptieve moeilijkheidsgraden en mini-quests biedt, afgestemd op de gebruiker en diens voortgang.
    *   **Robuuste Sociale Community:** Gebruikers kunnen vrienden maken, zich aansluiten bij tijdelijke 'Parties' of permanente 'Guilds', communiceren via chat en voice, content delen op een social feed, en deelnemen aan community-evenementen en competities. User-Generated Content speelt hierin een grote rol.
    *   **Data-Driven Inzichten:** Gedetailleerde statistieken en analyses bieden gebruikers inzicht in hun prestaties, gezondheid (via wearable integraties) en voortgang, ondersteund door AI-voorspellingen en alerts.
    *   **Veiligheid & Privacy:** Ontworpen met aandacht voor GDPR, privacy-instellingen (incl. anoniem deelnemen), 2FA en veiligheidsfuncties tijdens fysieke challenges (SOS, locatie delen).

*   **Doelgroep Applicatie:**
    De app richt zich op individuen die op zoek zijn naar motivatie, structuur en een leuke manier om zichzelf uit te dagen en te ontwikkelen, zowel alleen als samen met anderen. Dit omvat fitness-enthousiastelingen, **gamers die houden van MMO-achtige progressiesystemen en character building**, mensen die sociale connectie zoeken rond gedeelde activiteiten, en iedereen die persoonlijke groei op een interactieve manier wil benaderen.

*   **Doel & Scope van dit Document:**
    Dit document, de Functionele Specificaties, dient als de **blauwdruk van WAT de Challenger App moet kunnen**. Het definieert de functionele eisen vanuit het perspectief van de gebruiker en het systeem. Het is primair bedoeld voor het **ontwikkelteam (developers, QA engineers) en de Product Owner** om een gedeeld begrip van de functionele scope te waarborgen.
    **Technische implementatiedetails** (architectuur, libraries, API's, database), **gedetailleerde UI/UX-ontwerpen** (mockups, styling, specifieke layouts), en **non-functional requirements** (performance, security details, etc.) vallen uitdrukkelijk **buiten de scope** van dit document en worden elders gedefinieerd.

*   **Leeswijzer:**
    Na deze inleiding volgt een overzicht van de hoofdnavigatiestructuur en een functioneel blokdiagram (Sectie 2). Het kerndeel van dit document (Sectie 3) beschrijft de functionele features in detail, gegroepeerd per sub-functionaliteit. Elke functionele eis heeft een unieke ID (`F-X.Y.Z`) voor traceerbaarheid. Kernbegrippen worden eventueel toegelicht in de Appendix.


## 2. Hoofdnavigatie & Applicatie Structuur (Functioneel Overzicht)

Deze sectie beschrijft de belangrijkste functionele gebieden die toegankelijk zijn voor de gebruiker en hun primaire doel.

*   **Hoofdgebieden:**
    *   **Home/Dashboard:** Biedt de gebruiker een gepersonaliseerd overzicht van [bv. actieve challenges, recente notificaties, avatar status, snelle acties].
    *   **Challenges:** Stelt de gebruiker in staat om challenges te [bv. ontdekken, filteren, bekijken, aanmaken, deelnemen, beheren].
    *   **Social:** Faciliteert [bv. sociale interactie via een feed, chat, het vormen van groepen (parties/guilds)].
    *   **Stats/Avatar:** Toont de gebruiker [bv. persoonlijke statistieken, voortgang, prestaties, en biedt mogelijkheden voor avatar aanpassing].
    *   **Menu/Settings:** Geeft de gebruiker toegang tot [bv. accountbeheer, applicatie-instellingen, support, integraties].

*   **Functioneel Blokdiagram (Optioneel Voorbeeld):**
    *(Een simpel diagram dat de relaties tussen de hoofdgebieden toont)*
    ```
    +-------------------+      +-----------------+      +-------------------+
    |  Account Mgmt     |<---->|    Challenges   |<---->|      Social       |
    | (Login, Profile)  |      | (Discover, Do)  |      | (Feed, Chat, Groups)|
    +-------------------+      +-----------------+      +-------------------+
           ^                           |                         ^
           |                           v                         |
    +-------------------+      +-----------------+      +-------------------+
    |     Settings      |<---->|   Stats/Avatar  |<---->|   Notifications   |
    |  (Preferences)    |      | (Progress, Look)|      |                   |
    +-------------------+      +-----------------+      +-------------------+
           |                           |
           +---------------------------+
                       |
           +-------------------+
           |      Home         |
           |   (Dashboard)     |
           +-------------------+
    ```

---


### Feature 3.1: Core Challenge System

*   **Doel:** Dit is het hart van de app... (etc.)

*   **Sub-Functionaliteit: Discovery & Browsing**
    *   `F-3.1.1:` Systeem toont een overzicht van beschikbare challenges.
    *   `F-3.1.2:` Systeem biedt verschillende weergaven... [Lijst, Kaart, Kalender].
        *   *(Optionele ASCII-schets: Challenge Overview - Lijstweergave)*
        ```
        +------------------------------------------+
        | [Filters v] [ SearchChallenges...     ] |
        | [Sort By v] [View: List|Map|Cal]        |
        +------------------------------------------+
        | [ Challenge Item 1                     ] |
        | | Title: Epic Mountain Hike            | |
        | | Type: Physical | Diff: Hard | 10km  | |
        | +--------------------------------------+ |
        | [ Challenge Item 2                     ] |
        | | Title: City Photo Hunt               | |
        | | Type: Exploration | Diff: Easy | 2hr | |
        | +--------------------------------------+ |
        | [ Challenge Item 3 (...)               ] |
        |          (... scrollable ...)            |
        +------------------------------------------+
        ```
    *   `F-3.1.3:` Gebruiker kan challenges filteren...
    *   `F-3.1.4:` Gebruiker kan challenges sorteren...
    *   `F-3.1.5:` Gebruiker kan zoeken...
    *   `F-3.1.6:` Systeem kan aanbevolen challenges tonen...
    *   `F-3.1.7:` Systeem kan trending/populaire... tonen.
    *   `F-3.1.8:` Systeem kan 'Quick Challenges'... tonen.
    *   `F-3.1.9:` Gebruiker kan 'Auto Challenge Finder' gebruiken...
    *   `F-3.1.10:` Systeem kan Quests... presenteren.

*   **Sub-Functionaliteit: Viewing Challenge Details**
    *   `F-3.1.11:` Gebruiker kan gedetailleerde informatie... bekijken.
    *   `F-3.1.12:` Systeem toont de volgende challenge details...
        *   *(Optionele ASCII-schets: Challenge Detail Scherm)*
        ```
        +------------------------------------------+
        | [Challenge Title: Epic Mountain Hike]    |
        | By: [UserName] | Type: Physical | Hard  |
        +------------------------------------------+
        | [ Image/Video Placeholder ]              |
        |------------------------------------------|
        | Description:                             |
        | A challenging trek with stunning views...|
        | ...                                      |
        |------------------------------------------|
        | Route Preview: [Mini-Map Placeholder]    |
        |------------------------------------------|
        | Duration: ~4 hrs | Rewards: 500XP, Badge |
        | Materials: Hiking Boots, Water           |
        |------------------------------------------|
        | [ Ratings: ****☆ (15 Reviews) ]         |
        |------------------------------------------|
        | [ > START CHALLENGE < ] [ Share ] [Save] |
        +------------------------------------------+
        ```
    *   `F-3.1.13:` Systeem toont community ratings/reviews...
    *   `F-3.1.14:` Systeem kan gerelateerde challenges tonen...

*   **Sub-Functionaliteit: Challenge Creation & Management (User-Generated)**
    *   `F-3.1.15:` Gebruiker kan proces starten...
    *   `F-3.1.16:` Gebruiker definieert kergegevens...
    *   `F-3.1.17:` Gebruiker kan optionele details toevoegen...
    *   `F-3.1.18:` Gebruiker kan route definiëren...
        *   *(Optionele ASCII-schets: Challenge Creation Form - Concept)*
        ```
        +------------------------------------------+
        | << Create New Challenge >>               |
        +------------------------------------------+
        | Title:       [_________________________] |
        | Description: [_________________________] |
        |              [_________________________] |
        | Type:        [Physical v] Diff: [Easy v] |
        | Duration:    [______] hrs Rewards: [___]XP|
        |------------------------------------------|
        | Route Definition:                        |
        | [ Map Area - Place Start/Nodes... ]      |
        |------------------------------------------|
        | Media: [ Upload Image/Video Button ]     |
        |------------------------------------------|
        | Privacy: [ Public v ]                    |
        |------------------------------------------|
        | [ Save Draft ] [ Preview ] [ > Publish < ]|
        +------------------------------------------+
        ```
    *   `F-3.1.19:` Gebruiker kan privacy-instelling configureren...
    *   `F-3.1.20:` Gebruiker kan aangeven samenwerking...
    *   `F-3.1.21:` Systeem valideert data...
    *   `F-3.1.22:` Gebruiker kan preview bekijken...
    *   `F-3.1.23:` Gebruiker kan opslaan als concept/publiceren...
    *   `F-3.1.24:` Publicatie kan onderhevig zijn aan moderatie...
    *   `F-3.1.25:` Gebruiker kan eigen challenges beheren...

*   **Sub-Functionaliteit: Challenge Participation Lifecycle**
    *   `F-3.1.26:` Gebruiker kan deelnemen...
    *   `F-3.1.27:` Systeem registreert start...
    *   `F-3.1.28:` Gebruiker kan pauzeren...
    *   `F-3.1.29:` Systeem registreert pauze...
    *   `F-3.1.30:` Gebruiker kan hervatten...
    *   `F-3.1.31:` Gebruiker kan stoppen...
    *   `F-3.1.32:` Systeem registreert stop...
    *   `F-3.1.33:` Systeem detecteert voltooiing...
    *   `F-3.1.34:` Systeem registreert voltooid...
    *   `F-3.1.35:` Systeem initieert toekennen beloningen...
    *   `F-3.1.36:` Gebruiker kan geschiedenis inzien...

*   **Sub-Functionaliteit: Sharing & Saving Challenges**
    *   `F-3.1.37:` Gebruiker kan delen...
    *   `F-3.1.38:` Gebruiker kan markeren als favoriet...
    *   `F-3.1.39:` Gebruiker kan toevoegen aan watchlist...
    *   `F-3.1.40:` Gebruiker kan lijsten bekijken...

*   **Sub-Functionaliteit: Challenge Encounters & RNG Mini-Games**
    *   `F-3.1.X.1:` Systeem ondersteunt RNG-gebaseerde "Skill Check" mini-games die de uitkomst van bepaalde challenge-taken of node-interacties kunnen bepalen.
    *   `F-3.1.X.2:` Een "Dice Roll" Skill Check wordt geïnitieerd wanneer een gebruiker interageert met een specifieke challenge-stap of Node.
    *   `F-3.1.X.3:` De UI toont een (3D) dobbelsteen en de mogelijkheid om te rollen.
    *   `F-3.1.X.4:` De basis "kracht" of "potentieel" van de worp wordt beïnvloed door de `Strength` stat van de gebruiker (F-3.5). Dit kan zich uiten in een bonus op de worp, een hoger maximaal resultaat, of een gunstiger bereik.
    *   `F-3.1.X.5:` Het aantal keren dat een gebruiker kan proberen te rollen (per encounter/dag/challenge) wordt beïnvloed door de `Stamina` stat (F-3.5). Elke poging kan Stamina kosten.
    *   `F-3.1.X.6:` Gebruikers kunnen `Mana` (F-3.5) spenderen om "Dice Skills" te activeren voor een worp.
        *   `F-3.1.X.6.1:` Dice Skills kunnen effecten hebben zoals: verhogen van de worp, toevoegen van een defensieve bonus, toepassen van een debuff op een (virtuele) tegenstander, garanderen van een minimum worp, etc.
        *   `F-3.1.X.6.2:` Dice Skills kunnen verkregen/ontgrendeld worden via progressie (F-3.5) of items (F-3.7).
    *   `F-3.1.X.7:` Systeem kan een "tegenstander" simuleren die ook een worp doet of een vaste verdedigingswaarde heeft.
    *   `F-3.1.X.8:` De uitkomst van de mini-game (succes, deels succes, falen) beïnvloedt de challenge voortgang, kan items opleveren (F-3.7), XP toekennen (F-3.5), of andere challenge-specifieke consequenties hebben.
    *   `F-3.1.X.9:` Visuele en auditieve feedback wordt gegeven tijdens het rollen en bij het bekendmaken van de uitkomst.

---

### DEEL B: Implementatie Richtlijnen & Details (Voor Feature 3.1)

#### 5. Implementatie Context & Scope
*   **Feature Naam:** `Core Challenge System`
*   **Relevant(e) Bestand(en) (initieel):** `libs/challenges/data-access/`, `libs/challenges/domain/`, `libs/features/challenges/` (main feature module/routes/components), `libs/features/challenges/state/`, `libs/challenges/ui/` (reusable challenge components).

#### 6. Architectuur & Technische Keuzes (Feature-Specifiek)
    *   *(Instructie: Definieer HIER de specifieke architectuur en technische keuzes voor DEZE feature...)*
    *   **Data Access:**
        *   `- [ ] Service: \`ChallengeDataService\` (in \`libs/challenges/data-access\`) voor API calls (bv. \`getChallenges(filter)\`, \`getChallengeById(id)\`, \`createChallenge(payload)\`, \`updateChallenge(id, payload)\`, \`deleteChallenge(id)\`, \`joinChallenge(id)\`, \`leaveChallenge(id)\`).`
        *   `- [ ] Modellen (in \`libs/challenges/domain\`):`
            *   `- [ ] Interface: \`Challenge { challengeId: string; title: string; description: string; nodeIds: string[]; ... }\` (refereer F-3.1.12 voor velden).`
            *   `- [ ] Interface: \`ChallengeFilter { type?: string; location?: GeoBounds; difficulty?: number; searchTerm?: string; ... }\` (refereer F-3.1.3, F-3.1.5).`
            *   `- [ ] Interface: \`ChallengeCreatePayload { title: string; description: string; ... }\`.`
            *   `- [ ] Enum: \`ChallengeViewMode { List, Map, Calendar }\`.`
    *   **State Management (NgRx):**
        *   `- [ ] Feature State Slice: \`challengesState\` (in \`libs/features/challenges/state\`).`
        *   `- [ ] State Properties: \`challengeList: Challenge[]\`, \`selectedChallenge: Challenge | null\`, \`currentFilters: ChallengeFilter\`, \`viewMode: ChallengeViewMode\`, \`isLoadingList: boolean\`, \`isLoadingDetails: boolean\`, \`error: any\`, \`userChallengeParticipation: { [challengeId: string]: ParticipationStatus } | null\`.`
        *   `- [ ] Belangrijkste Actions: \`loadChallengeList\`, \`loadChallengeListSuccess\`, \`loadChallengeListFailure\`, \`loadChallengeDetails\`, \`loadChallengeDetailsSuccess\`, ..., \`updateFilters\`, \`setViewMode\`, \`createChallenge\`, \`createChallengeSuccess\`, ..., \`joinChallenge\`, \`leaveChallenge\`, `pauseChallenge`, `resumeChallenge`, `completeChallenge`.`
        *   `- [ ] Belangrijkste Selectors: \`selectFilteredChallengeList\`, \`selectSelectedChallengeDetails\`, \`selectIsLoadingList\`, \`selectCurrentViewMode\`, \`selectParticipationStatus(challengeId)\`.`
        *   `- [ ] Facade: \`ChallengeFacade\` (in \`libs/features/challenges\`) voor component interactie.`
    *   **Feature Logic/Services:**
        *   `- [ ] Service: \`ChallengeValidationService\` (optioneel, in feature lib of domain?) voor complexe validaties bij challenge creatie.`
        *   `- [ ] Service: \`ChallengeNavigationService\` (in feature lib?) voor het routeren naar detail/create/overview pagina's.`
    *   **Belangrijkste UI Componenten (Herbruikbaarheid):**
        *   `- [ ] Container/Page Component(en): \`ChallengeOverviewPageComponent\`, \`ChallengeDetailPageComponent\`, \`ChallengeCreatePageComponent\`, \`ChallengeParticipationTrackingComponent` (Mogelijk onderdeel van Feature 3.3, maar getriggerd vanuit hier).`
        *   `- [ ] Presentational/Reusable Component(en):`
            *   `- [ ] \`ChallengeListComponent\` (in \`libs/challenges/ui\`) - Toont lijst, \`@Input() challenges: Challenge[]\`, \`@Output() challengeSelected\`.`
            *   `- [ ] \`ChallengeMapComponent\` (in \`libs/challenges/ui` of `libs/features/map`) - Toont challenge start nodes op kaart, `@Input() challenges: Challenge[]`, `@Output() challengeSelected`.`
            *   `- [ ] \`ChallengeCalendarComponent\` (in \`libs/challenges/ui`) - Toont challenges in kalender view.`
            *   `- [ ] \`ChallengeCardComponent\` (in \`libs/challenges/ui\`) - Presenteert 1 challenge in lijst/grid.` <!-- Voor F-3.1.1 -->
            *   `- [ ] \`ChallengeFilterBarComponent\` (in \`libs/features/challenges/ui\`?) - Bevat filter controls.` <!-- Voor F-3.1.3, F-3.1.4, F-3.1.5 -->
            *   `- [ ] \`ChallengeDetailDisplayComponent\` (in \`libs/challenges/ui\`) - Toont details, \`@Input() challenge: Challenge\`.` <!-- Voor F-3.1.12 -->
            *   `- [ ] \`ChallengeCreateFormComponent\` (in \`libs/features/challenges/ui\`?) - Het formulier zelf (Reactive Forms).` <!-- Voor F-3.1.15 - F-3.1.18 -->
            *   `- [ ] \`ChallengeActionButtonComponent\` (in \`libs/challenges/ui`) - Generieke knop voor Join/Leave/Pause etc. \`@Input() actionType\`, \`@Input() challengeId\`.`

#### 7. UI/UX Breakdown & Requirements (Gedetailleerd)
    * *(Instructie: Beschrijf HIER de gewenste UI, UX, styling en interacties op component-niveau...)*

    * **ChallengeOverviewPageComponent**
        * `- [ ] Component: \`ChallengeOverviewPageComponent\` (Container)`
            * `- [ ] Layout: Bevat de \`ChallengeFilterBarComponent\` bovenaan, gevolgd door de actieve weergave (\`ChallengeListComponent\`, \`ChallengeMapComponent\`, of \`ChallengeCalendarComponent\`).`
            * `- [ ] Kern Elementen:`
                * `- [ ] Filter Bar: Toont de filter component.` <!-- F-3.1.3, F-3.1.4, F-3.1.5 -->
                * `- [ ] View Toggle: Knoppen/tabs om te wisselen tussen List/Map/Calendar view.` <!-- F-3.1.2 -->
                * `- [ ] Weergave Gebied: Toont de geselecteerde view component.` <!-- F-3.1.1 -->
                * `- [ ] (Optioneel) 'Create Challenge' knop.` <!-- Trigger voor F-3.1.15 -->
            * `- [ ] Belangrijkste Interacties:`
                * `- [ ] Filter wijziging: Ontvangt \`filterChange\` event, dispatched \`updateFilters\` action.`
                * `- [ ] View Toggle Klik: Dispatched \`setViewMode\` action.`
                * `- [ ] Challenge Selectie (vanuit List/Map): Ontvangt \`challengeSelected\` event, navigeert naar detail pagina.` <!-- Trigger voor F-3.1.11 -->
                * `- [ ] Create Klik: Navigeert naar create pagina.`
            * `- [ ] State/Inputs/Outputs: Gebruikt \`ChallengeFacade\` om \`challenges$\`, \`isLoading$\`, \`viewMode$\` te selecteren. Dispatched actions.`

    * **ChallengeCardComponent**
        * `- [ ] Component: \`ChallengeCardComponent\` (\`libs/challenges/ui/...\`)`
            * `- [ ] Layout: Typische kaart layout (afbeelding bovenaan, content eronder).`
            * `- [ ] Kern Elementen:`
                * `- [ ] Titel, Type, Difficulty, Duration/Distance.` <!-- F-3.1.12 (subset) -->
                * `- [ ] Korte beschrijving (preview).`
                * `- [ ] Creator info (optioneel).`
                * `- [ ] 'View Details' knop/link of hele kaart is klikbaar.`
            * `- [ ] Belangrijkste Interacties:`
                * `- [ ] Klik: Emittert \`challengeSelected\` met \`challenge.challengeId\`.` <!-- Trigger voor F-3.1.11 -->
            * `- [ ] State/Inputs/Outputs: \`@Input() challenge: Challenge\`. \`@Output() challengeSelected = new EventEmitter<string>()\`.`

    * **ChallengeDetailPageComponent**
        * `- [ ] Component: \`ChallengeDetailPageComponent\` (Container)`
            * `- [ ] Layout: Toont alle details van de geselecteerde challenge, waarschijnlijk met \`ChallengeDetailDisplayComponent\`.`
            * `- [ ] Kern Elementen:`
                * `- [ ] Display Component: Toont alle velden zoals gedefinieerd in F-3.1.12.`
                * `- [ ] Actieknoppen: Join/Start, Leave, Pause/Resume, Share, Add to Watchlist. Gebruikt bv. \`ChallengeActionButtonComponent\`.` <!-- F-3.1.26, F-3.1.28, F-3.1.30, F-3.1.31, F-3.1.37, F-3.1.38 -->
                * `- [ ] Ratings/Reviews sectie.` <!-- F-3.1.13 -->
                * `- [ ] Gerelateerde Challenges sectie (optioneel).` <!-- F-3.1.14 -->
            * `- [ ] Belangrijkste Interacties:`
                * `- [ ] Klik Actieknop: Roept corresponderende methode aan op \`ChallengeFacade\` (bv. \`challengeFacade.joinChallenge(challengeId)\`).`
            * `- [ ] State/Inputs/Outputs: Haalt \`selectedChallengeDetails$\` op via \`ChallengeFacade\`. Dispatcht acties bij knopklik.`

    * **ChallengeCreatePageComponent / ChallengeCreateFormComponent**
        * `- [ ] Component: \`ChallengeCreatePageComponent\` (Container), \`ChallengeCreateFormComponent\` (Presentational/Form)`
            * `- [ ] Layout: Formulier layout met velden voor alle challenge eigenschappen.`
            * `- [ ] Kern Elementen:`
                * `- [ ] Input velden voor Titel, Beschrijving, Type, Difficulty, etc.` <!-- F-3.1.16, F-3.1.17 -->
                * `- [ ] Kaart interactie voor route/node selectie.` <!-- F-3.1.18 -->
                * `- [ ] Media upload component.` <!-- F-3.1.17 -->
                * `- [ ] Privacy selectie.` <!-- F-3.1.19 -->
                * `- [ ] Preview knop, Opslaan als Concept, Publiceren knop.` <!-- F-3.1.22, F-3.1.23 -->
            * `- [ ] Belangrijkste Interacties:`
                * `- [ ] Formulier invullen: Gebruikt Angular Reactive Forms voor validatie.` <!-- F-3.1.21 -->
                * `- [ ] Publiceren Klik: Roept \`challengeFacade.createChallenge(formData)\` aan na validatie.`
            * `- [ ] State/Inputs/Outputs: PageComponent gebruikt Facade. FormComponent handelt form state af, emittert \`submit\` event.`


----- 

### Feature 3.2: Node System Foundation

*   **Doel:** Definieert het fundamentele systeem van interactieve punten ('Nodes') in de wereld van de Challenger App. Nodes vormen de basis voor locatie-gebonden gameplay, challenges, sociale interactie, economie en verkenning. Dit systeem is ontworpen als een uitbreidbaar framework om diverse interactieve locaties in de 'Real Life MMO'-wereld te ondersteunen en te beheren, zowel in 2D, 3D als via AR.

*   **Sub-Functionaliteit: Node Definition & Core Properties**
    *   `F-3.2.1:` Systeem definieert een 'Node' als een unieke entiteit met specifieke eigenschappen.
    *   `F-3.2.2:` Elke Node heeft minimaal de volgende kernattributen: [bv. `nodeId` (unique), `location` (lat, lng, opt. altitude/indoor info), `nodeType`, `status`, `creatorId` (system/user/guild), `creationTimestamp`, `lastUpdatedTimestamp`].
    *   `F-3.2.3:` Systeem ondersteunt het opslaan en opvragen van Node data.
    *   `F-3.2.4:` Systeem moet ontworpen zijn om toekomstige uitbreiding met nieuwe Node types en eigenschappen te faciliteren.

      
*   **Sub-Functionaliteit: Node Types & Specific Purpose**
    *   `F-3.2.5:` Systeem ondersteunt verschillende `nodeType` waarden, die het primaire functionele doel van de Node bepalen. Deze lijst is initieel en kan worden uitgebreid.
    *   `F-3.2.6:` Ondersteunde Node Types moeten minimaal omvatten:

        **A. Challenge & Quest Focused Nodes:**
        *   `ChallengeStartNode`: Het expliciete startpunt van een Challenge of Quest lijn. Activeert de tracking.
        *   `ChallengeCheckpointNode`: Een waypoint binnen een challenge route die bereikt moet worden. Valideert voortgang, kan sub-beloningen of informatie geven.
        *   `ChallengeFinishNode`: Het eindpunt van een challenge route. Markeert voltooiing en triggert eindbeloningen.
        *   `QuestGiverNode`: Een interactiepunt (mogelijk met NPC-achtige context) waar een specifieke Quest of opdracht kan worden geaccepteerd of ingeleverd.
        *   `DungeonEntranceNode`: Toegangspunt tot een meer complexe, mogelijk gelaagde of instanced challenge (een 'dungeon run' in MMO-termen).

        **B. Exploration & World Interaction Nodes:**
        *   `POINode` (Point of Interest): Markeert een interessante locatie met lore, een mooi uitzicht, historische info, of een klein interactief element (bv. een raadsel). Beloningen vaak gericht op exploratie XP.
        *   `DiscoveryNode`: Een verborgen of moeilijk bereikbare node die significante exploratiebeloningen geeft bij eerste activatie door een gebruiker of de community.
        *   `WaypointNode`: Een strategisch geplaatste node die, na activatie, kan functioneren als een Fast Travel punt (mogelijk met kosten of cooldown) naar andere ontdekte WaypointNodes.

        **C. Economy & Resource Nodes:**
        *   `ResourceNode`: Een locatie waar specifieke crafting materialen of resources periodiek kunnen worden geoogst/verzameld door gebruikers. Kan uitgeput raken en respawnen. Verschillende tiers/zeldzaamheden mogelijk.
        *   `VendorNode` (was ShopNode): Een systeem-gestuurde 'winkel' waar standaard items, reparaties, of diensten gekocht/verkocht kunnen worden met in-game currency.
        *   `TradingPostNode`: Een centrale hub waar gebruikers mogelijk onderling items kunnen verhandelen of aanbieden via een veilinghuis-achtig systeem (complexere functionaliteit voor later).

        **D. Social & Community Nodes:**
        *   `CommunityHubNode`: Een centrale sociale ontmoetingsplek in een bepaald gebied. Kan functies combineren zoals een algemeen berichtenbord (node feed), event aankondigingen, toegang tot leaderboards, of startpunt voor lokale group activities.
        *   `GuildHallNode`: Een speciale, mogelijk upgradebare node die exclusief door een Guild beheerd wordt. Kan dienen als HQ, toegang bieden tot guild-specifieke bonussen, bank, of crafting stations. (Meer persistent dan Territory Control).

        **E. Strategy & Conflict Nodes:**
        *   `TerritoryControlNode`: Een strategisch punt dat door Guilds geclaimd en verdedigd kan worden in 'Territory Wars'. Het bezit ervan levert de Guild voordelen op (bv. resource bonussen, XP-boost in het gebied, guild taks).
        *   `WatchtowerNode`: Een type Territory Node dat extra zichtbaarheid of defensieve bonussen biedt in het gecontroleerde gebied.
        *   `ArenaNode`: Een specifiek afgebakend gebied/node waar spelers formeel kunnen duelleren (PvP) zonder de gebruikelijke consequenties (bv. geen item loss). Kan rankings hebben.

        **F. Utility & Environmental Nodes:**
        *   `EventSpawnNode`: Een node die alleen actief wordt tijdens specifieke, vaak tijdelijke, in-game evenementen (bv. locatie van een world boss, startpunt van een seizoensquest).
        *   `SanctuaryNode`: Een veilige zone waar PvP mogelijk niet is toegestaan, en gebruikers wellicht sneller health/stamina regenereren of specifieke rust-bonussen krijgen.
        *   `HazardNode` (of `EnvironmentalEffectZone`): Een punt of gebied dat een effect toepast op spelers die erin komen (bv. langzamer bewegen, DoT, stat verlaging), wat navigatie uitdagender maakt.

    *   `F-3.2.7:` Nodes kunnen door het systeem worden geconfigureerd om meerdere rollen te combineren (bv. een `CommunityHubNode` die ook een `VendorNode` bevat). De primaire `nodeType` bepaalt de hoofdfunctionaliteit en visualisatie.

    
*   **Sub-Functionaliteit: Node Status & Lifecycle**
    *   `F-3.2.8:` Elke Node heeft een definieerbare `status` die de toegankelijkheid en interactiemogelijkheden bepaalt.
    *   `F-3.2.9:` Ondersteunde statussen moeten minimaal omvatten: [bv. `Locked` (niet toegankelijk/zichtbaar?), `Unlocked`/`Visible` (zichtbaar, basis interactie mogelijk), `Active` (specifieke interactie mogelijk, bv. binnen challenge), `Completed` (interactie voltooid voor deze gebruiker/sessie), `Expired`/`Archived` (niet langer actief, bv. voor tijdelijke nodes)].
    *   `F-3.2.10:` Systeem werkt de Node `status` bij op basis van triggers [bv. gebruikersnabijheid (proximity), voortgang in een challenge, tijd, gebruikersactie, guild actie].

*   **Sub-Functionaliteit: Node Discovery & Visualization**
    *   `F-3.2.11:` Systeem stelt gebruikers in staat om Nodes te ontdekken en te visualiseren op een kaartinterface.
    *   `F-3.2.12:` Systeem toont Nodes op de kaart als markers, waarbij de visualisatie (icoon, kleur, animatie) kan variëren op basis van `nodeType` en `status`.
        *   *(Optionele ASCII-schets: Kaart met diverse Node Markers)*
        ```
        +------------------------------------------+
        | [ Filter Nodes v ] [ Search Location...] |
        +------------------------------------------+
        |                                          |
        |      (S)        (*)                      |
        |         ^                                |
        |               (P)        ($)             |
        |    (R)                                   |
        |           (C)        (G)               |
        |                                          |
        +------------------------------------------+
        S=Start, C=Checkpoint, P=POI, R=Resource
        $=Shop, G=Guild Territory, *=Quest, ^=User
        (Markers are indicative of type/status)
        ```
    *   `F-3.2.13:` Systeem ondersteunt het renderen van Node visualisaties in 2D (kaart), 3D (voor toekomstige avatar wereld weergave) en AR (overlays - zie Feature 3.3 & 3.7).
    *   `F-3.2.14:` Gebruiker kan filteren welke Node types zichtbaar zijn op de kaart.

*   **Sub-Functionaliteit: Basic Node Interaction**
    *   `F-3.2.15:` Gebruiker kan basisinformatie van een zichtbare/unlocked Node opvragen (bv. naam, type, korte beschrijving).
    *   `F-3.2.16:` Gebruiker kan de intentie aangeven om te navigeren naar een geselecteerde Node (start navigatie via Feature 3.3).
    *   `F-3.2.17:` Systeem detecteert wanneer een gebruiker binnen een gedefinieerde interactieradius van een Node is (proximity detection).
    *   `F-3.2.18:` Het binnen de interactieradius zijn kan de Node `status` wijzigen (bv. naar `Active`) en specifieke interacties mogelijk maken (gedefinieerd door de feature die de Node gebruikt, bv. challenge checkpoint valideren, winkel openen, resource verzamelen).

*   **Sub-Functionaliteit: Node-Based Social Interaction (Generic)**
    *   `F-3.2.19:` Systeem faciliteert een locatie-gebonden sociale feed gekoppeld aan specifieke Nodes (vooral `SocialNode` of als extra laag op andere types).
    *   `F-3.2.20:` Gebruiker kan berichten (tekst, media) plaatsen op de feed van een Node (mits binnen interactieradius/unlocked).
    *   `F-3.2.21:` Gebruiker kan de feed van een Node bekijken (berichten, media).
    *   `F-3.2.22:` Systeem ondersteunt een onderscheid tussen 'publieke' Node content (zichtbaar voor iedereen die de Node details kan zien) en 'private'/'local' Node content (alleen zichtbaar/plaatsbaar voor gebruikers die fysiek in de buurt zijn/geactiveerd hebben).
    *   `F-3.2.23:` Gebruiker kan reageren op Node-specifieke feed items (bv. like, dislike, commentaar).

*   **Sub-Functionaliteit: Node Management (Admin/System)**
    *   `F-3.2.24:` Systeem biedt mechanismen (bv. admin interface, API) voor het creëren, bijwerken en beheren van systeem-gegenereerde Nodes. (User-generated nodes via challenge creation vallen onder F-3.1.18).


---
#### DEEL B: Implementatie Richtlijnen & Details (Voor Feature 3.2)

##### 5. Implementatie Context & Scope
*   **Feature Naam:** `Node System Foundation`
*   **Relevant(e) Bestand(en) (initieel):** `libs/nodes/data-access/`, `libs/nodes/domain/` (voor enums/interfaces), `libs/features/map/` (waar node visualisatie waarschijnlijk plaatsvindt), `libs/features/map/state/` (voor state gerelateerd aan zichtbare nodes), `libs/nodes/ui/` (voor node-specifieke UI elementen zoals markers, popups).

##### 6. Architectuur & Technische Keuzes (Feature-Specifiek)
    *   *(Instructie: Definieer HIER de specifieke architectuur en technische keuzes voor DEZE feature...)*
    *   **Data Access:**
        *   `- [ ] Service: \`NodeDataService\` (in \`libs/nodes/data-access\`) voor API calls (bv. \`getNodesInBounds(bounds)\`, \`getNodeDetails(nodeId)\`, mogelijk \`activateNode(nodeId)\`).`
        *   `- [ ] Modellen (in \`libs/nodes/domain\`):`
            *   `- [ ] Interface: \`Node { nodeId: string; location: GeoPoint; nodeType: NodeType; status: NodeStatus; properties: Record<string, any>; ... }\`.`
            *   `- [ ] Interface: \`GeoPoint { lat: number; lng: number; alt?: number }\`.`
            *   `- [ ] Enum: \`NodeType { ChallengeStartNode, POINode, ResourceNode, ... }\`.`
            *   `- [ ] Enum: \`NodeStatus { Locked, Visible, Active, Completed, ... }\`.`
            *   `- [ ] Interface: \`NodeFilter { types?: NodeType[]; statuses?: NodeStatus[]; ... }\`.`
    *   **State Management (NgRx):**
        *   `- [ ] Feature State Slice: \`mapState\` of \`worldState\` (in bv. \`libs/features/map/state\`) lijkt logischer dan een aparte 'nodeState', omdat nodes sterk gekoppeld zijn aan de kaartweergave.`
        *   `- [ ] State Properties: \`visibleNodes: Node[]\`, \`selectedNodeId: string | null\`, \`nodeFilters: NodeFilter\`, \`mapBounds: LatLngBounds\`, \`loadingNodes: boolean\`, \`error: any\`.`
        *   `- [ ] Belangrijkste Actions: \`mapBoundsChanged\`, \`loadNodesRequested\`, \`loadNodesSuccess\`, \`loadNodesFailure\`, \`nodeSelected\`, \`nodeDeselected\`, \`applyNodeFilters\`, \`nodeInteractionTriggered(nodeId, interactionType)\`.`
        *   `- [ ] Belangrijkste Selectors: \`selectVisibleFilteredNodes\`, \`selectSelectedNodeDetails\`, \`selectNodesLoadingStatus\`.`
        *   `- [ ] Facade: \`MapFacade\` (in \`libs/features/map\`) handelt interactie af m.b.t. zichtbare nodes en selectie.`
    *   **Feature Logic/Services:**
        *   `- [ ] Service: \`ProximityService\` (mogelijk in \`libs/core\` of \`libs/features/tracking\`)? Verantwoordelijk voor het detecteren of de gebruiker dichtbij Nodes is, gebaseerd op user locatie en node locaties uit state. Kan events/actions dispatchen.`
        *   `- [ ] Service: \`NodeTypeConfigService\` (bv. in \`libs/nodes/domain\` of \`libs/features/map\`)? Bevat configuratie per NodeType (bv. icon, kleur, beschikbare basis interacties).`
        *   `- [ ] Service: \`NodeInteractionHandlerService\` (mogelijk in \`libs/features/map\` of \`libs/core`)? Luistert naar \`nodeInteractionTriggered\` action en routeert de interactie naar de juiste feature facade (bv. ChallengeFacade.startChallenge, VendorFacade.openShop, ResourceFacade.gatherResource).`
    *   **Belangrijkste UI Componenten (Herbruikbaarheid):**
        *   `- [ ] Container/Page Component(en): \`MapPageComponent\` (in \`libs/features/map\`) - Toont kaart, filters, laadt data via facade.`
        *   `- [ ] Presentational/Reusable Component(en):`
            *   `- [ ] \`MapDisplayComponent\` (in \`libs/shared/ui-map\` of direct Leaflet/Mapbox integratie) - Toont de kaart, ontvangt markers, geeft events (bounds change, click).`
            *   `- [ ] \`NodeMarkerComponent\` (in \`libs/nodes/ui\`) - Rendert 1 marker op de kaart (\`@Input() node: Node\`), past uiterlijk aan o.b.v. type/status, emittert \`markerClick\`.` <!-- F-3.2.12 -->
            *   `- [ ] \`NodeFilterComponent\` (in \`libs/features/map/ui\`?) - Toont filteropties, emittert \`filterChange\`.` <!-- F-3.2.14 -->
            *   `- [ ] \`NodeInfoPopupComponent\` (in \`libs/nodes/ui\`) - Kleine popup bij marker click, toont basisinfo, \`@Input() node: Node\`, emittert \`navigateToClick\`, \`viewDetailsClick\`.` <!-- F-3.2.15, F-3.2.16 -->
            *   `- [ ] \`NodeFeedComponent\` (in \`libs/features/social/ui` of `libs/nodes/ui`) - Component voor de locatie-gebonden feed (`@Input() nodeId: string`).` <!-- F-3.2.19 - F-3.2.23 -->

##### 7. UI/UX Breakdown & Requirements (Gedetailleerd)
    * *(Instructie: Beschrijf HIER de gewenste UI, UX, styling en interacties op component-niveau...)*

    * **MapPageComponent / MapDisplayComponent**
        * `- [ ] Component: \`MapPageComponent\` (Container), \`MapDisplayComponent\` (Presentational)`
            * `- [ ] Layout: Kaart vult het grootste deel van het scherm. Filter/zoekbalk mogelijk als overlay bovenaan.`
            * `- [ ] Kern Elementen:`
                * `- [ ] Kaartlaag: Toont geografische kaart (bv. via Leaflet).` <!-- F-3.2.11 -->
                * `- [ ] Node Markers: Array van \`NodeMarkerComponent\` instances, gepositioneerd op basis van \`node.location\`. Wordt gevoed door \`selectVisibleFilteredNodes\`.` <!-- F-3.2.12 -->
                * `- [ ] Filter Controls: \`NodeFilterComponent\` wordt getoond.` <!-- F-3.2.14 -->
                * `- [ ] (Optioneel) Gebruikerslocatie marker.`
                * `- [ ] (Optioneel) Laadindicator terwijl nodes laden.`
            * `- [ ] Belangrijkste Interacties:`
                * `- [ ] Pan/Zoom: MapDisplayComponent emittert \`boundsChange\`. MapPageComponent luistert en dispatched \`mapBoundsChanged\` action.` <!-- Trigger voor F-3.2.3 -->
                * `- [ ] Marker Klik: NodeMarkerComponent emittert \`markerClick\`. MapPageComponent luistert en dispatched \`nodeSelected\` action met \`nodeId\`.` <!-- F-3.2.15 -->
                * `- [ ] Filter Wijziging: NodeFilterComponent emittert \`filterChange\`. MapPageComponent dispatched \`applyNodeFilters\`.` <!-- F-3.2.14 -->
            * `- [ ] State/Inputs/Outputs: MapPageComponent gebruikt \`MapFacade\`. MapDisplayComponent ontvangt \`nodes: Node[]\` als @Input, emittert events.`

    * **NodeMarkerComponent**
        * `- [ ] Component: \`NodeMarkerComponent\` (\`libs/nodes/ui/...\`)`
            * `- [ ] Layout: Een enkele marker op de kaart.`
            * `- [ ] Kern Elementen:`
                * `- [ ] Icoon/Afbeelding: Visuele representatie. Stijl/icoon is afhankelijk van \`node.nodeType\` en \`node.status\` (bv. via \`NodeTypeConfigService\` of CSS classes). Kan pulseren/animeren bij bepaalde statussen.` <!-- F-3.2.12 -->
            * `- [ ] Belangrijkste Interacties:`
                * `- [ ] Klik: Emittert \`markerClick\` met de \`node.nodeId\`.` <!-- F-3.2.15 -->
                * `- [ ] (Optioneel) Hover: Toont tooltip met \`node.name\`?`
            * `- [ ] State/Inputs/Outputs: \`@Input() node: Node\`. \`@Output() markerClick = new EventEmitter<string>()\`.`

    * **NodeInfoPopupComponent**
        * `- [ ] Component: \`NodeInfoPopupComponent\` (\`libs/nodes/ui/...\`)`
            * `- [ ] Layout: Kleine popup/card die verschijnt bij een geselecteerde marker (mogelijk via CDK Overlay of direct op kaart getekend).`
            * `- [ ] Kern Elementen:`
                * `- [ ] Node Titel.`
                * `- [ ] Node Type icoon/label.`
                * `- [ ] Korte beschrijving (indien beschikbaar).`
                * `- [ ] 'Navigeer' knop.` <!-- F-3.2.16 -->
                * `- [ ] 'Sluit' knop.`
                * `- [ ] (Optioneel) Link naar Node Feed / 'Bekijk berichten' knop.` <!-- Link naar F-3.2.21 -->
            * `- [ ] Belangrijkste Interacties:`
                * `- [ ] Klik 'Navigeer': Emittert \`navigateToClick\` met \`node.nodeId\`/`node.location`.` <!-- F-3.2.16 -->
                * `- [ ] Klik 'Bekijk berichten': Navigeert naar/opent Node Feed view.`
            * `- [ ] State/Inputs/Outputs: \`@Input() node: Node | null\`. Emitters voor acties.`

    * **NodeFeedComponent**
        * `- [ ] Component: \`NodeFeedComponent\` (\`libs/features/social/ui` of `libs/nodes/ui/...\`)`
            * `- [ ] Layout: Lijst van berichten/media specifiek voor een Node.`
            * `- [ ] Kern Elementen:`
                * `- [ ] Input veld om nieuw bericht/media te posten (alleen actief indien F-3.2.20 & F-3.2.22 waar zijn).` <!-- F-3.2.20 -->
                * `- [ ] Lijst van bestaande berichten (bv. \`FeedItemComponent\` hergebruiken?).` <!-- F-3.2.21 -->
                * `- [ ] Mogelijkheid om te filteren tussen 'Publiek' en 'Lokaal' (indien F-3.2.22 geïmplementeerd).`
            * `- [ ] Belangrijkste Interacties:`
                * `- [ ] Posten bericht: Roept service aan om bericht op te slaan gekoppeld aan \`nodeId\`.`
                * `- [ ] Reageren op berichten.` <!-- F-3.2.23 -->
            * `- [ ] State/Inputs/Outputs: \`@Input() nodeId: string\`. Haalt feed data op (mogelijk via eigen service/facade).`

------


### Feature 3.3: Navigation & Tracking

*   **Doel:** Biedt de systemen en interfaces voor real-time locatiebepaling, het volgen van routes (vooral tijdens challenges), het begeleiden van de gebruiker via diverse hulpmiddelen (kaart, kompas, AR, audio), en het waarborgen van veiligheid tijdens fysieke activiteiten. Deze feature werkt nauw samen met het Node Systeem (Feature 3.2) en het Core Challenge System (Feature 3.1).

*   **Sub-Functionaliteit: Real-time Activity Tracking & Data Capture**
    *   `F-3.3.1:` Systeem kan de geografische locatie (GPS: latitude, longitude, altitude) van de gebruiker in real-time bepalen en volgen wanneer een tracking-sessie actief is (bv. tijdens een challenge).
    *   `F-3.3.2:` Systeem kan bewegingsdata vastleggen [bv. snelheid, afgelegde afstand, tijd in beweging].
    *   `F-3.3.3:` Systeem kan data van gekoppelde wearables of sensoren uitlezen tijdens een actieve sessie (via Feature 3.11) [bv. hartslag, stappen, cadans].
    *   `F-3.3.4:` Systeem registreert de verzamelde tracking data gekoppeld aan de actieve sessie/challenge en de gebruiker.

*   **Sub-Functionaliteit: Route Visualization & Progress During Activity**
    *   `F-3.3.5:` Systeem toont een specifieke interface ('Tracker View' / 'Navigator') wanneer een gebruiker actief deelneemt aan een challenge met een gedefinieerde route.
    *   `F-3.3.6:` Deze interface toont een (interactieve) kaart met daarop:
        *   De gedefinieerde challenge route (lijn/pad).
        *   De Nodes (waypoints) van de route (start, checkpoints, finish, etc. - zie Feature 3.2).
        *   De huidige real-time positie van de gebruiker.
        *   (Optioneel) De positie van partymembers (indien gedeeld - zie Feature 3.4).
    *   `F-3.3.7:` Systeem werkt de positie van de gebruiker op de kaart continu bij.
    *   `F-3.3.8:` Systeem visualiseert de voortgang langs de route [bv. afgelegd deel van de route ingekleurd, indicatie van afstand/tijd tot volgende Node].
    *   `F-3.3.9:` Systeem past de route dynamisch aan of geeft alternatieven aan indien de gebruiker significant afwijkt (optioneel, kan AI-gestuurd zijn - link naar Feature 3.7).

*   **Sub-Functionaliteit: Navigation Assistance**
    *   `F-3.3.10:` Systeem biedt de gebruiker actieve navigatiehulp richting de volgende relevante Node op de route.
    *   `F-3.3.11:` Systeem ondersteunt meerdere navigatiemodi die de gebruiker kan kiezen (beschikbaarheid kan afhangen van challenge/instellingen):
        *   `Map Mode`: Focus op de kaartweergave (zie F-3.3.6).
        *   `Compass Mode`: Toont een minimalistische richtingaanwijzer/kompasbalk die naar de volgende Node wijst.
        *   `AR Pathway Mode`: Gebruikt de camera en AR om een visueel pad of aanwijzingen in de echte wereld te projecteren (vereist AR-functionaliteit).
        *   `Audio Guidance Mode`: Geeft gesproken instructies of audio cues voor navigatie (bv. via AI Avatar stem - link naar Feature 3.7).
    *   `F-3.3.12:` Systeem kan extra beloningen toekennen op basis van de gebruikte navigatiemodus (bv. meer XP voor 'moeilijkere' modi zoals audio-only - link naar Features 3.5/3.6).
        *   *(Optionele ASCII-schets: Concept Tracker View met Modus Switch)*
        ```
        +------------------------------------------+
        | Challenge: Epic Hike | Next: CP 2 (1.2km)|
        +------------------------------------------+
        | [ Map Area / AR View / Compass Display ] |
        |                                          |
        |          (Visual Nav Aid Area)           |
        |                                          |
        |                                          |
        +------------------------------------------+
        | Current Speed: 5 km/h | Time: 0:45:12    |
        |------------------------------------------|
        | [Nav Mode: Map|Compass|AR|Audio] [Pause] |
        | [ SOS ]                                  |
        +------------------------------------------+
        ```

*   **Sub-Functionaliteit: Node Interaction During Navigation**
    *   `F-3.3.13:` Systeem detecteert het naderen en bereiken van een Node binnen de gedefinieerde interactieradius tijdens een actieve tracking-sessie.
    *   `F-3.3.14:` Systeem kan de visualisatie van een Node aanpassen wanneer deze wordt benaderd of bereikt [bv. oplichten, pulseren, AR-effect].
    *   `F-3.3.15:` Systeem kan visuele of auditieve signalen geven om de gebruiker naar de volgende Node te leiden (bv. richtingaanwijzers vanuit de huidige Node).
    *   `F-3.3.16:` Het bereiken van een Node triggert de relevante status update en maakt de Node-specifieke interactie mogelijk (bv. checkpoint validatie `F-3.1.33`, resource verzamelen `F-3.6.x`, POI info tonen `F-3.2.x`).

*   **Sub-Functionaliteit: Safety Features During Activity**
    *   `F-3.3.17:` Gebruiker kan vanuit de actieve tracker/navigator interface een SOS/noodsignaal activeren.
    *   `F-3.3.18:` Activeren van SOS stuurt een bericht (met huidige locatie en context) naar vooraf ingestelde noodcontacten (configuratie via Feature 3.9/3.4).
    *   `F-3.3.19:` Gebruiker kan expliciet live locatie delen met geselecteerde contacten of partymembers tijdens een actieve sessie (configuratie via Feature 3.9/3.4).
    *   `F-3.3.20:` Systeem toont de gedeelde locatie van anderen (indien toestemming gegeven) op de kaart tijdens de sessie.

*   **Sub-Functionaliteit: Data Sync & Offline Handling**
    *   `F-3.3.21:` Systeem moet tracking data (locatie, tijd, afstand, etc.) kunnen blijven vastleggen, ook bij tijdelijk verlies van internetverbinding (offline modus).
    *   `F-3.3.22:` Systeem moet offline verzamelde data synchroniseren met de backend zodra de verbinding is hersteld.
    *   `F-3.3.23:` Systeem moet basisnavigatie (bv. op basis van vooraf gedownloade kaart/route) kunnen bieden tijdens offline modus, indien mogelijk.


    ### Feature 3.4: Social & Community

*   **Doel:** Biedt de functionaliteiten waarmee gebruikers kunnen interacteren, communiceren, samenwerken en content delen binnen de Challenger App community. Dit vormt het sociale hart van de applicatie, essentieel voor engagement, retentie en de MMO-sfeer.

*   **Sub-Functionaliteit: Social Feed & Content Sharing**
    *   `F-3.4.1:` Systeem toont een configureerbare social feed aan de gebruiker.
    *   `F-3.4.2:` De feed bevat content zoals [bv. posts van vrienden, updates van gevolgde guilds, gedeelde challenge prestaties, systeem aankondigingen, aanbevolen content].
    *   `F-3.4.3:` Gebruiker kan een nieuwe post maken op de feed.
    *   `F-3.4.4:` Een post kan bestaan uit [data-elementen: bv. `text`, `mediaUrls` (images, videos), `linkToChallengeId`, `linkToAchievementId`, `locationTag`].
    *   `F-3.4.5:` Gebruiker kan de zichtbaarheid/privacy van een eigen post instellen [bv. `public`, `friends_only`, `guild_only`].
    *   `F-3.4.6:` Gebruiker kan reageren op feed posts [bv. `like`, diverse `reactions` (emoji-based), `comment`].
    *   `F-3.4.7:` Gebruiker kan commentaren plaatsen onder feed posts. Commentaren ondersteunen [bv. tekst, @mentions].
    *   `F-3.4.8:` Gebruiker kan feed posts delen (re-post binnen de app, of delen naar externe apps).
    *   `F-3.4.9:` Gebruiker kan eigen posts en commentaren bewerken of verwijderen.
    *   `F-3.4.10:` Gebruiker kan content op de feed rapporteren (link naar Feature 3.12).
        *   *(Optionele ASCII-schets: Basis Feed Post Structuur)*
        ```
        +------------------------------------------+
        | [Avatar] [UserName] @ [Timestamp]        |
        |------------------------------------------|
        | Post Text Content...                     |
        | [Optional Linked Challenge Preview]      |
        | [Optional Image/Video Display]           |
        |------------------------------------------|
        | [Like/React] [Comment(#)] [Share] [Report]|
        |------------------------------------------|
        | > Comment 1...                           |
        | > Comment 2...                           |
        | [ Add a comment... ]                     |
        +------------------------------------------+
        ```

*   **Sub-Functionaliteit: Direct & Group Messaging**
    *   `F-3.4.11:` Gebruiker kan één-op-één chatgesprekken starten en voeren met andere gebruikers (vrienden).
    *   `F-3.4.12:` Gebruiker kan groepschats aanmaken met meerdere deelnemers.
    *   `F-3.4.13:` Gebruiker kan deelnemers toevoegen aan of verwijderen uit groepschats (afhankelijk van rechten).
    *   `F-3.4.14:` Chatberichten ondersteunen [bv. `text`, `emojis`, `gifs`, delen van `mediaUrls`, delen van `challengeLinks`, @mentions].
    *   `F-3.4.15:` Systeem toont de online/offline status van contacten (indien gedeeld).
    *   `F-3.4.16:` Systeem levert notificaties voor nieuwe chatberichten (link naar Feature 3.14).
    *   `F-3.4.17:` Gebruiker kan chatgesprekken dempen of verlaten.
    *   `F-3.4.18:` Gebruiker kan chatberichten rapporteren.

*   **Sub-Functionaliteit: Voice Communication**
    *   `F-3.4.19:` Systeem ondersteunt real-time voice chat.
    *   `F-3.4.20:` Gebruiker kan deelnemen aan specifieke voice chat rooms [bv. gekoppeld aan een actieve Party, Guild, of specifiek event].
    *   `F-3.4.21:` Gebruiker kan microfoon dempen/unmuten.
    *   `F-3.4.22:` Systeem toont wie er in de voice room aanwezig is en wie er spreekt.

*   **Sub-Functionaliteit: Friends & Following System**
    *   `F-3.4.23:` Gebruiker kan vriendschapsverzoeken sturen naar andere gebruikers.
    *   `F-3.4.24:` Gebruiker kan ontvangen vriendschapsverzoeken accepteren of weigeren.
    *   `F-3.4.25:` Gebruiker heeft een lijst van vrienden.
    *   `F-3.4.26:` Gebruiker kan een vriend verwijderen.
    *   `F-3.4.27:` Gebruiker kan andere gebruikers volgen om hun publieke feed posts te zien, zonder wederzijds vriendschap.
    *   `F-3.4.28:` Gebruiker kan zien wie hem/haar volgt (volgerslijst).
    *   `F-3.4.29:` Gebruiker kan gebruikers blokkeren om interactie te voorkomen.

*   **Sub-Functionaliteit: Parties (Temporary Groups)**
    *   `F-3.4.30:` Gebruiker kan een tijdelijke 'Party' aanmaken, typisch voor het samen doen van een challenge.
    *   `F-3.4.31:` Gebruiker kan vrienden of recente spelers uitnodigen voor de Party.
    *   `F-3.4.32:` Systeem biedt een 'Party Finder' mechanisme waar gebruikers openbare Parties kunnen zoeken/filteren [op basis van bv. challenge type, regio, intensiteit] en eraan deelnemen.
    *   `F-3.4.33:` Partyleden kunnen (indien gedeeld) elkaars status zien [bv. locatie op kaart tijdens challenge (link naar F-3.3.6), challenge voortgang, health/stamina].
    *   `F-3.4.34:` Systeem kan bonussen (bv. XP boost) toekennen voor gezamenlijk voltooide activiteiten in een Party (link naar Features 3.5/3.6).
    *   `F-3.4.35:` Een Party heeft een eigen (tijdelijke) groepschat en mogelijk een voice channel.
    *   `F-3.4.36:` Gebruiker kan een Party verlaten; de Party wordt ontbonden als de leider vertrekt of als er geen leden meer zijn.

*   **Sub-Functionaliteit: Guilds (Persistent Groups/Clans)**
    *   `F-3.4.37:` Gebruiker kan een permanente 'Guild' oprichten (mogelijk met kosten in in-game currency).
    *   `F-3.4.38:` Gebruiker kan lidmaatschap aanvragen bij een bestaande Guild.
    *   `F-3.4.39:` Guild leiderschap (met rechten) kan aanvragen accepteren/weigeren en leden beheren (promoten, degraderen, kicken).
    *   `F-3.4.40:` Systeem biedt een 'Guild Finder' / Overzichtspagina waar gebruikers Guilds kunnen zoeken/filteren [op basis van bv. focus, grootte, regio] en bekijken.
    *   `F-3.4.41:` Elke Guild heeft een eigen profielpagina met [data-elementen: bv. `guildName`, `guildTag`, `description`, `memberList` (met rollen), `guildStats` (totaal XP, prestaties), `publicMessageBoard`].
    *   `F-3.4.42:` Guilds hebben eigen, persistente chatkanalen en mogelijk voice channels.
    *   `F-3.4.43:` Guilds kunnen deelnemen aan exclusieve Guild Challenges (zie Feature 3.1) en evenementen (zie Feature 3.8).
    *   `F-3.4.44:` Guilds kunnen strijden om controle over Territory Nodes (zie Feature 3.10).
    *   `F-3.4.45:` Guilds kunnen een eigen 'Guild Hall' Node hebben/beheren (zie Feature 3.2).
    *   `F-3.4.46:` Gebruiker kan een Guild verlaten.

*   **Sub-Functionaliteit: Mentorship Program**
    *   `F-3.4.47:` Gebruiker kan zich in het systeem registreren als 'Mentor' (ervaren speler) of als 'Beginner' (op zoek naar hulp).
    *   `F-3.4.48:` Systeem biedt een overzicht of matching mechanisme om Mentoren en Beginners te koppelen [op basis van bv. interesses, activiteit type, taal].
    *   `F-3.4.49:` Systeem kan specifieke interacties of beloningen faciliteren voor actieve mentor/beginner relaties (link naar Features 3.5/3.6).



    ### Feature 3.5: User Profile & Progression

*   **Doel:** Biedt gebruikers inzicht in hun eigen voortgang, statistieken en prestaties binnen de app. Definieert hoe gebruikers XP verdienen, levelen, skills ontwikkelen en hun publieke profiel en visuele avatar representatie beheren. Werkt nauw samen met vrijwel alle andere features die XP of statistieken genereren.

*   **Sub-Functionaliteit: User Profile Viewing & Management**
    *   `F-3.5.1:` Systeem biedt elke gebruiker een persoonlijk profielscherm.
    *   `F-3.5.2:` Het profielscherm toont minimaal de volgende gebruikersinformatie: [bv. `userId`, `userName`, `displayAvatar`, `currentLevel`, `currentXP`, `title`/`rank`, `guildAffiliation` (link naar Feature 3.4), belangrijke `achievements` (link naar Feature 3.6), selectie van `showcasedStats`].
    *   `F-3.5.3:` Gebruiker kan bepaalde onderdelen van het eigen profiel bewerken [bv. `userName` (met beperkingen), `bio`/`statusMessage`, `displayAvatar`, welke prestaties/stats getoond worden].
    *   `F-3.5.4:` Gebruiker kan de profielen van andere (niet-geblokkeerde) gebruikers bekijken. De zichtbare informatie kan afhangen van privacy-instellingen (zie Feature 3.9) en vriendschapsstatus.
    *   `F-3.5.5:` Het bekijken van een ander profiel toont vergelijkbare informatie als F-3.5.2, maar met acties zoals [bv. 'Add Friend', 'Send Message', 'View Guild', 'Report User'].

*   **Sub-Functionaliteit: Experience Points (XP) & Leveling System**
    *   `F-3.5.6:` Systeem kent Experience Points (XP) toe aan de gebruiker voor het voltooien van [bv. challenges (F-3.1.35), specifieke Node interacties (F-3.2.x), geregistreerde fysieke activiteit (F-3.3.x), social interacties (bv. mentorship F-3.4.49), event deelname (F-3.8.x)].
    *   `F-3.5.7:` Systeem houdt de totale XP en de voortgang naar het volgende level bij voor de gebruiker.
    *   `F-3.5.8:` Systeem toont de XP-voortgangsbalk/status aan de gebruiker (bv. op profiel, dashboard).
    *   `F-3.5.9:` Bij het bereiken van een drempelwaarde aan XP, levelt de gebruiker automatisch up.
    *   `F-3.5.10:` Een level-up resulteert in [bv. toekennen van `skillPoints` (zie F-3.5.14), ontgrendelen van nieuwe features/content, visuele notificatie/animatie, mogelijke stat-verhogingen (indien van toepassing)].
    *   `F-3.5.11:` Systeem ondersteunt een (optioneel) 'Prestige' systeem waarbij gebruikers op het maximale level kunnen kiezen om te resetten (level/skills) in ruil voor exclusieve cosmetische beloningen of permanente (kleine) bonussen.

*   **Sub-Functionaliteit: Skill System (Skill Trees & Perks)**
    *   `F-3.5.12:` Systeem biedt één of meerdere Skill Trees waar gebruikers hun voortgang kunnen specialiseren.
    *   `F-3.5.13:` Skill Trees zijn opgebouwd uit nodes (skills/perks) die specifieke voordelen bieden [bv. verhoogde XP-gain voor bepaald type challenge, bonus stats, korting in shops, verbeterde crafting, speciale social ability].
    *   `F-3.5.14:` Gebruiker kan verdiende `skillPoints` (verkregen bij bv. level-up) spenderen om skills/perks in de Skill Tree te ontgrendelen of te upgraden, volgens de regels/afhankelijkheden van de tree.
    *   `F-3.5.15:` Gebruiker kan de eigen ontgrendelde skills/perks en de beschikbare Skill Trees inzien.
    *   `F-3.5.16:` Systeem staat mogelijk het wisselen tussen of het resetten van Skill Trees toe (mogelijk met kosten of beperkingen).

*   **Sub-Functionaliteit: Statistics & Activity Log**
    *   `F-3.5.17:` Systeem biedt een persoonlijk dashboard of statistieken-sectie aan de gebruiker.
    *   `F-3.5.18:` Systeem toont diverse persoonlijke statistieken, gegroepeerd per categorie [bv. Algemeen (totaal XP, level, voltooide challenges); Fysiek (totaal afstand, calorieën verbrand, snelste tijd); Mentaal (voltooide focus-challenges); Sociaal (aantal vrienden, guild bijdrage)].
    *   `F-3.5.19:` Systeem toont trends en grafieken van geselecteerde statistieken over tijd (bv. wekelijkse/maandelijkse activiteit).
    *   `F-3.5.20:` Systeem integreert en toont relevante health & endurance data van gekoppelde wearables/platforms (via Feature 3.11) [bv. hartslagzones tijdens activiteit, slaapanalyse, stappendoelen].
    *   `F-3.5.21:` Systeem biedt een gedetailleerd 'Activity Log' (geschiedenis) van recente activiteiten [bv. voltooide challenges, verdiende achievements, belangrijke interacties].
    *   `F-3.5.22:` Gebruiker kan (delen van) de eigen statistieken of activity log exporteren [bv. naar CSV, PDF].
    *   `F-3.5.23:` Systeem kan statistieken van de gebruiker aggregeren voor weergave op Guild profielen (link naar F-3.4.41) of Leaderboards (Feature 3.5).
    *   `F-3.5.24:` (Optioneel) Systeem ondersteunt 'Mood Tracking' waarbij gebruiker de eigen stemming kan loggen en trends kan inzien.

*   **Sub-Functionaliteit: Avatar Visual Customization**
    *   `F-3.5.25:` Gebruiker kan het uiterlijk van zijn/haar display avatar aanpassen.
        *   *(Nota: Dit betreft de visuele representatie van de gebruiker, die mogelijk maar niet noodzakelijk dezelfde is als de functionele AI Avatar uit Feature 3.7. Duidelijkheid hierover is nodig in tech design.)*
    *   `F-3.5.26:` Aanpassingsopties omvatten minimaal [bv. kiezen van basis model/geslacht, huidskleur, haarstijl/kleur].
    *   `F-3.5.27:` Gebruiker kan de avatar aankleden met virtuele kledingstukken en accessoires (items verkregen via Feature 3.6).
    *   `F-3.5.28:` Systeem toont een preview van de avatar tijdens het aanpassen.
    *   `F-3.5.29:` Gebruiker slaat de gekozen aanpassingen op, die vervolgens zichtbaar zijn op het profiel en mogelijk elders in de app.
    *   `F-3.5.30:` (Optioneel) Gebruiker kan de achtergrond/omgeving van de avatar op het profiel aanpassen.
        *   *(Optionele ASCII-schets: Avatar Customization Scherm)*
        ```
        +------------------------------------------+
        | << Avatar Customization >>               |
        +------------------------------------------+
        | [ 3D Preview Window of Avatar ]          |
        |                                          |
        |          [ Rotate/Zoom Controls ]        |
        +------------------------------------------+
        | Tabs: [ Body | Head | Outfits | Accsrs ] |
        |------------------------------------------|
        | Options for selected tab:                |
        | [ Option 1 ] [ Option 2 ] [ Option 3 ]   |
        | [ Option 4 ] [ Option 5 ] [ Option 6 ]   |
        |         (... scrollable ...)             |
        |------------------------------------------|
        | [ Undo ] [ Save Changes ]                |
        +------------------------------------------+
        ```



### Feature 3.6: Achievements & Leaderboards

*   **Doel:** Biedt systemen voor het erkennen van gebruikersprestaties via achievements (badges, medailles) en het faciliteren van competitie via leaderboards (ranglijsten). Deze feature motiveert gebruikers door mijlpalen te vieren en sociale vergelijking mogelijk te maken.

*   **Sub-Functionaliteit: Achievement System**
    *   `F-3.6.1:` Systeem definieert een set van 'Achievements' die gebruikers kunnen verdienen door specifieke criteria te behalen.
    *   `F-3.6.2:` Achievement criteria kunnen betrekking hebben op [bv. voltooien van X aantal challenges, bereiken van een bepaald level, lopen van Y afstand, deelnemen aan een event, uitvoeren van zeldzame actie, behalen van een lange streak].
    *   `F-3.6.3:` Elke achievement heeft eigenschappen zoals [bv. `achievementId`, `name`, `description`, `criteriaDescription`, `iconUrl`/`badgeGraphic`, `rewardPoints` (optioneel, bovenop standaard XP), `rarityLevel`].
    *   `F-3.6.4:` Systeem detecteert automatisch wanneer een gebruiker voldoet aan de criteria voor een achievement.
    *   `F-3.6.5:` Bij het behalen van een achievement, ontvangt de gebruiker een notificatie (link naar Feature 3.14) en wordt de achievement als 'verdiend' gemarkeerd in het gebruikersprofiel.
    *   `F-3.6.6:` Gebruiker kan een overzicht bekijken van alle beschikbare achievements, met indicatie van welke verdiend zijn en welke nog niet (inclusief voortgang naar nog niet behaalde achievements, indien meetbaar).
    *   `F-3.6.7:` Gebruiker kan verdiende achievements (badges) selecteren om prominent te tonen op het eigen User Profile (link naar Feature 3.4).
    *   `F-3.6.8:` Systeem kan achievements categoriseren [bv. op type activiteit, moeilijkheid, evenement-specifiek].
    *   `F-3.6.9:` (Optioneel) Systeem ondersteunt 'dynamische' of multi-tier achievements (bv. Brons/Zilver/Goud voor het lopen van 10/50/100 km).
    *   `F-3.6.10:` (Optioneel) Systeem ondersteunt 'verborgen' achievements die pas zichtbaar worden nadat ze zijn verdiend.

*   **Sub-Functionaliteit: Leaderboard System**
    *   `F-3.6.11:` Systeem biedt diverse Leaderboards (ranglijsten) waarop gebruikers hun prestaties kunnen vergelijken met anderen.
    *   `F-3.6.12:` Leaderboards kunnen gebaseerd zijn op verschillende statistieken en scopes [bv. Totaal XP (Globaal, Vrienden, Guild), Voltooide Challenges (Totaal, Per Type), Afgelegde Afstand, Specifieke Challenge/Event Score, Territory Control Punten].
    *   `F-3.6.13:` Leaderboards hebben een gedefinieerde tijdsperiode [bv. All-Time, Seizoensgebonden, Maandelijks, Wekelijks, Dagelijks, Event-specifiek]. Leaderboards worden periodiek gereset.
    *   `F-3.6.14:` Systeem toont de ranglijst met minimaal [bv. `rank`, `userName`, `score`, `userAvatar`].
    *   `F-3.6.15:` Systeem toont de positie van de huidige gebruiker op de leaderboard, ook als deze buiten de top X valt.
    *   `F-3.6.16:` Gebruiker kan navigeren/filteren tussen verschillende beschikbare leaderboards.
    *   `F-3.6.17:` Systeem kan (optioneel) league-tiers implementeren (bv. Brons, Zilver, Goud) met promotie/degradatie op basis van prestaties in periodieke leaderboards.
    *   `F-3.6.18:` Systeem kan beloningen toekennen aan top-gerankte spelers aan het einde van een leaderboard periode (link naar Feature 3.6).
    *   `F-3.6.19:` Leaderboards kunnen worden weergegeven op specifieke `LeaderboardNodes` in de wereld (link naar Feature 3.2).
    *   `F-3.6.20:` (Optioneel) Systeem kan een 'Rivalen' functionaliteit bieden, waarbij gebruikers automatisch of handmatig worden gekoppeld aan spelers van vergelijkbaar niveau voor directe vergelijking.
        *   *(Optionele ASCII-schets: Leaderboard Weergave)*
        ```
        +------------------------------------------+
        | << Leaderboard: Weekly XP Gain (Global) >> |
        | [ Filter: Global|Friends|Guild ] [Period: Wk|Mth|Season] |
        +------------------------------------------+
        | 1. [Avatar] AlphaGamer      15,200 XP    |
        | 2. [Avatar] BetaChallenger  14,850 XP    |
        | 3. [Avatar] GammaRunner     14,500 XP    |
        | ...                                      |
        | ---------------------------------------- |
        | 85.[Avatar] YourUserName     9,100 XP    | <--- Current User
        | ...                                      |
        |          (... scrollable ...)            |
        +------------------------------------------+
        ```

*   **Sub-Functionaliteit: Streak Tracking**
    *   `F-3.6.21:` Systeem houdt 'streaks' bij voor gebruikers op basis van consistente activiteit [bv. dagelijks inloggen, dagelijks een challenge voltooien, wekelijks X aantal stappen zetten].
    *   `F-3.6.22:` Systeem toont de huidige streak lengte aan de gebruiker.
    *   `F-3.6.23:` Het behalen van langere streaks kan leiden tot bonussen [bv. XP multipliers, exclusieve (tijdelijke) rewards, speciale badges] (link naar Features 3.4/3.6).
    *   `F-3.6.24:` Systeem definieert de voorwaarden waaronder een streak behouden blijft of verbroken wordt.
    *   `F-3.6.25:` (Optioneel) Systeem kan een 'streak herstel' mechanisme bieden (bv. een kleine buffer of een specifieke challenge om een net verbroken streak te herstellen).


### Feature 3.7: Items, Crafting & Economy

*   **Doel:** Definieert het systeem voor virtuele items, hoe gebruikers deze verkrijgen (beloningen, crafting, aankoop), beheren (inventaris) en gebruiken (uitrusten voor bonussen, consumeren, verhandelen). Ondersteunt de in-game economie en item-gebaseerde progressie.

*   **Sub-Functionaliteit: Item Definition & Types**
    *   `F-3.7.1:` Systeem definieert 'Items' als unieke virtuele objecten die gebruikers kunnen bezitten.
    *   `F-3.7.2:` Elk Item heeft basis eigenschappen [bv. `itemId` (unique), `itemName`, `itemDescription`, `itemType`, `iconUrl`, `rarityLevel` (common, uncommon, rare, epic, legendary), `isStackable`, `maxStackSize`].
    *   `F-3.7.3:` Systeem ondersteunt verschillende `itemType` waarden, zoals:
        *   `Equipment`: Items die de gebruiker kan uitrusten op de avatar voor statistische bonussen of cosmetische veranderingen (bv. kleding, gear - link naar F-3.5.27). Equipment heeft specifieke `equipmentSlot` eigenschappen (head, chest, legs, etc.) en kan `statsModifiers` bevatten.
        *   `Consumable`: Items die eenmalig gebruikt kunnen worden voor een tijdelijk effect (bv. XP boost potion, stamina refill, tijdelijke skill).
        *   `CraftingMaterial`: Grondstoffen gebruikt in het crafting proces (zie F-3.7.14).
        *   `Recipe`/`Blueprint`: Items die nodig zijn om te leren hoe een ander item gecraft kan worden.
        *   `LootBox`/`Container`: Items die geopend kunnen worden om willekeurige andere items of currency te onthullen.
        *   `Currency`: Speciale items die als betaalmiddel fungeren (bv. `Gold`, `Gems`).
        *   `QuestItem`: Items specifiek nodig voor het voltooien van een quest (link naar Feature 3.1).
        *   `Collectible`: Items primair bedoeld om te verzamelen (bv. voor achievements - link naar Feature 3.6).
    *   `F-3.7.4:` Systeem moet ontworpen zijn voor uitbreiding met nieuwe item types en eigenschappen.

*   **Sub-Functionaliteit: Obtaining Items**
    *   `F-3.7.5:` Gebruikers kunnen items verkrijgen als beloning voor [bv. het voltooien van challenges (F-3.1.35), het behalen van achievements (F-3.6.x), het openen van `LootBox` items, deelname aan events (F-3.8.x), interactie met specifieke Nodes].
    *   `F-3.7.6:` Gebruikers kunnen `CraftingMaterial` items verzamelen door interactie met `ResourceNodes` in de wereld (link naar F-3.2.6).
    *   `F-3.7.7:` Gebruikers kunnen items creëren via het Crafting System (zie F-3.7.14).
    *   `F-3.7.8:` Gebruikers kunnen items kopen bij `VendorNodes` (link naar F-3.2.6) of via een centrale in-app shop (mogelijk link naar Feature 3.10 Monetization voor premium currency).
    *   `F-3.7.9:` Gebruikers kunnen items ontvangen via handel met andere spelers (indien `TradingPostNode` of direct trade geïmplementeerd - zie F-3.7.26).

*   **Sub-Functionaliteit: Inventory Management**
    *   `F-3.7.10:` Elke gebruiker heeft een persoonlijke 'Inventaris' (inventory/bag) waar verkregen items worden opgeslagen.
    *   `F-3.7.11:` Systeem toont de inventaris aan de gebruiker, gegroepeerd of filterbaar op `itemType`.
    *   `F-3.7.12:` Systeem toont details van een geselecteerd item in de inventaris [bv. naam, beschrijving, type, rarity, stats (indien equipment), stack count].
    *   `F-3.7.13:` Gebruiker kan items binnen de inventaris beheren [bv. sorteren, stapels splitsen/samenvoegen (indien `isStackable`), items verwijderen ('destroy')]. De inventaris kan een limiet hebben op aantal slots of totaalgewicht (optioneel).
        *   *(Optionele ASCII-schets: Inventaris Grid)*
        ```
        +------------------------------------------+
        | << Inventory >> [Capacity: 85/100]       |
        | [Filter: All|Equip|Consume|Mat] [Sort v] |
        +------------------------------------------+
        | [Itm1] [Itm2] [Itm3] [Itm4] [Itm5] [Itm6] |
        | [Itm7] [Itm8] [Stk9(x5)] [Itm10] ...     |
        | ....                                     |
        |          (... scrollable grid ...)       |
        |------------------------------------------|
        | Selected: [Item Name]                    |
        | [Item Icon] Rarity: Rare | Type: Equip   |
        | Description: Grants +5 Strength.         |
        | [ Equip ] [ Drop ] [ Lock ]              |
        +------------------------------------------+
        ```

*   **Sub-Functionaliteit: Crafting System**
    *   `F-3.7.14:` Systeem biedt een 'Crafting' interface/mechanisme.
    *   `F-3.7.15:` Gebruiker kan bekende `Recipes`/`Blueprints` selecteren om te zien welke `CraftingMaterial` items nodig zijn om een specifiek item te maken.
    *   `F-3.7.16:` Gebruiker kan het craften van een item initiëren als de benodigde materialen (uit inventaris) en eventuele andere voorwaarden (bv. skill level, benodigde `CraftingStationNode`) aanwezig zijn.
    *   `F-3.7.17:` Na succesvol craften worden de materialen uit de inventaris verbruikt en wordt het nieuwe item toegevoegd aan de inventaris. Craften kan een (korte) tijd duren.
    *   `F-3.7.18:` Gebruiker leert nieuwe recipes door [bv. het vinden/kopen/ontvangen van `Recipe`/`Blueprint` items, bereiken van skill levels].

*   **Sub-Functionaliteit: Item Usage & Equipping**
    *   `F-3.7.19:` Gebruiker kan `Equipment` items vanuit de inventaris uitrusten op de corresponderende `equipmentSlot` van de avatar.
    *   `F-3.7.20:` Uitgeruste equipment past de statistieken en/of het uiterlijk van de avatar aan (link naar Features 3.4, 3.5).
    *   `F-3.7.21:` Gebruiker kan `Consumable` items vanuit de inventaris gebruiken om het effect te activeren.
    *   `F-3.7.22:` Gebruiker kan `LootBox`/`Container` items openen vanuit de inventaris.
    *   `F-3.7.23:` Gebruiker kan `QuestItems` gebruiken of inleveren zoals vereist door de quest (link naar Feature 3.1).

*   **Sub-Functionaliteit: Virtual Economy & Trade (Optioneel/Toekomst)**
    *   `F-3.7.24:` Systeem definieert één of meerdere `Currency` types (bv. `Gold` verdiend in-game, `Gems` mogelijk premium).
    *   `F-3.7.25:` Gebruiker kan items kopen/verkopen bij `VendorNodes` voor in-game currency. Systeem bepaalt koop/verkoop prijzen.
    *   `F-3.7.26:` (Geavanceerd) Systeem kan een `TradingPostNode` (veilinghuis) ondersteunen waar gebruikers items kunnen aanbieden voor verkoop aan andere spelers en kunnen bieden op items van anderen.
    *   `F-3.7.27:` (Geavanceerd) Systeem kan directe speler-tot-speler handel ondersteunen (met veiligheidsmaatregelen).
    *   `F-3.7.28:` Systeem moet mechanismen bevatten om de in-game economie te balanceren (bv. currency sinks, item sinks, drop rates).



    ### Feature 3.8: AI Interaction & Personalization

*   **Doel:** Definieert de functionaliteit rond de AI-component van de app, inclusief hoe de AI interacteert met de gebruiker (bv. als coach, gids), hoe deze wordt beïnvloed door gebruikersvoortgang, en hoe AI wordt ingezet voor het personaliseren van de gebruikerservaring (bv. adaptieve moeilijkheid, aanbevelingen).

*   **Sub-Functionaliteit: AI Avatar Presence & Interaction**
    *   `F-3.8.1:` Systeem presenteert een (optionele) AI Avatar als een virtuele compagnon/coach voor de gebruiker.
        *   *(Nota: Duidelijkheid nodig of dit dezelfde visuele avatar is als die de gebruiker aanpast (F-3.5.25), of een aparte entiteit. Voor nu gaan we uit van een functionele AI-entiteit die *kan* worden gerepresenteerd door de gebruikersavatar.)*
    *   `F-3.8.2:` De AI Avatar kan proactief of reactief communiceren met de gebruiker via [bv. tekstberichten, gesproken feedback (audio), visuele cues/animaties].
    *   `F-3.8.3:` AI Avatar biedt de gebruiker [bv. real-time feedback tijdens challenges, motiverende berichten, tips & strategieën, gepersonaliseerde groeten].
    *   `F-3.8.4:` AI Avatar kan de gebruiker 'mini-quests' of dagelijkse/wekelijkse doelen voorstellen, afgestemd op de gebruiker.
    *   `F-3.8.5:` Gebruiker kan (tot op zekere hoogte) de interactiestijl of persoonlijkheid van de AI Avatar configureren (bv. toon, frequentie van interactie).

*   **Sub-Functionaliteit: AI Avatar Evolution & State**
    *   `F-3.8.6:` De 'staat' of 'capaciteiten' van de AI Avatar evolueren op basis van de progressie van de gebruiker [bv. level (F-3.5.9), behaalde skills (F-3.5.14), voltooide story quests].
    *   `F-3.8.7:` De geëvolueerde staat van de AI Avatar beïnvloedt de *soort* of *kwaliteit* van de interacties/feedback die het kan geven (bv. betere tips, toegang tot geavanceerdere strategieën).
    *   `F-3.8.8:` (Optioneel) De AI Avatar kan gespecialiseerde rollen ontwikkelen (bv. Coach, Strateeg, Explorer) op basis van de speelstijl/keuzes van de gebruiker, wat leidt tot verschillende soorten ondersteuning.

*   **Sub-Functionaliteit: AI-Driven Personalization of Gameplay**
    *   `F-3.8.9:` Systeem gebruikt AI-algoritmes om de moeilijkheidsgraad van challenges dynamisch aan te passen ('Adaptive Difficulty') op basis van [bv. gebruikers prestaties, profiel, ingestelde voorkeuren].
    *   `F-3.8.10:` Systeem gebruikt AI om gepersonaliseerde aanbevelingen te genereren voor [bv. challenges (F-3.1.6), Quests, te volgen gebruikers/guilds, interessante Nodes, items in de shop].
    *   `F-3.8.11:` Systeem gebruikt AI om gepersonaliseerde notificaties of reminders te sturen (link naar Feature 3.14) [bv. aanmoediging bij inactiviteit, waarschuwing bij mogelijke overbelasting (gebaseerd op health data), suggestie voor volgende logische stap/challenge].
    *   `F-3.8.12:` Systeem gebruikt AI om potentiële 'Rivalen' voor te stellen op basis van vergelijkbaar niveau/speelstijl (link naar F-3.6.20).
    *   `F-3.8.13:` Systeem kan AI gebruiken voor het voorspellen van gebruikersvoortgang of het suggereren van realistische doelen.

*   **Sub-Functionaliteit: AI in Navigation & World Interaction**
    *   `F-3.8.14:` De AI Avatar kan functioneren als de stem voor audio-navigatie tijdens challenges (zie F-3.3.11).
    *   `F-3.8.15:` De AI Avatar kan contextuele informatie of hints geven bij het naderen of interacteren met specifieke Nodes.
    *   `F-3.8.16:` De AI kan (optioneel) reageren op omgevingsfactoren [bv. weer, tijdstip] met relevante opmerkingen of suggesties.

*   **Sub-Functionaliteit: AI & Social Interaction**
    *   `F-3.8.17:` De AI Avatar kan (optioneel) berichten sturen binnen party/guild chats [bv. herinneringen aan teamchallenges, statusupdates].
    *   `F-3.8.18:` De AI kan (optioneel) helpen bij het vinden van geschikte Parties of Guilds (Party/Guild Finder assistance).

*   **Sub-Functionaliteit: Parties (Temporary Groups)**
    *   `F-3.4.30:` Gebruiker kan een tijdelijke 'Party' aanmaken, typisch voor het samen doen van een challenge.
    *   `F-3.4.31:` Gebruiker kan vrienden of recente spelers uitnodigen voor de Party.
    *   `F-3.4.32:` Systeem biedt een 'Party Finder' mechanisme waar gebruikers openbare Parties kunnen zoeken/filteren [op basis van bv. challenge type, regio, intensiteit] en eraan deelnemen.
    *   `F-3.4.33:` Partyleden kunnen (indien gedeeld) elkaars status zien [bv. locatie op kaart tijdens challenge (link naar F-3.3.6), challenge voortgang, health/stamina].
    *   **`F-3.4.33a:` (NIEUW) Systeem biedt een visuele representatie van de actieve Party-leden binnen de Party-interface of een specifiek 'Party Scherm'.**
    *   **`F-3.4.33b:` (NIEUW) Deze representatie toont de (AI) Avatars van de Party-leden gezamenlijk, waardoor de party visueel wordt voorgesteld.** *(De specifieke look en animatie van de avatars valt onder Feature 3.8, de weergave in party context is hier gedefinieerd).*
    *   `F-3.4.34:` Systeem kan bonussen (bv. XP boost) toekennen voor gezamenlijk voltooide activiteiten in een Party (link naar Features 3.5/3.7).
    *   `F-3.4.35:` Een Party heeft een eigen (tijdelijke) groepschat en mogelijk een voice channel.
    *   `F-3.4.36:` Gebruiker kan een Party verlaten; de Party wordt ontbonden als de leider vertrekt of als er geen leden meer zijn.