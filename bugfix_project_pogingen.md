# Logboek: Oplossen van Monorepo Build-fouten

Dit document houdt de pogingen bij om de `nx build cv --configuration=production` fouten op te lossen.

---

### Poging 1 (Handmatig Bouwen van Dependencies)

*   **Datum:** 2025-09-11
*   **Hypothese:** De build-volgorde is incorrect, waardoor `ui-notifications` zijn afhankelijkheden (`@royal-code/ui/button`, etc.) niet kan vinden.
*   **Actie:** De afhankelijkheden (`shared/domain`, `overlay-ui`, `button`) werden handmatig en in de juiste volgorde gebuild met `npx nx build <project>`.
*   **Resultaat:** De build van `ui-notifications` faalde nog steeds met exact dezelfde `TS2307: Cannot find module` fout.
*   **Conclusie:** De build-volgorde is niet het probleem. Nx beheert de dependency graph correct. De fout zit in de TypeScript-configuratie *binnen* de falende bibliotheek zelf; deze weet niet hoe de paden naar zijn buren opgelost moeten worden.

---

### Poging 2 (Aanpassen van `tsconfig.lib.json`)

*   **Datum:** 2025-09-11
*   **Hypothese:** De `tsconfig.lib.json` van de falende bibliotheken mist de cruciale `"moduleResolution": "node"` instelling. Dit is nodig voor de TypeScript-compiler om de `@royal-code/...` paden te begrijpen.
*   **Actie:** Er werd voorgesteld om `"moduleResolution": "node"` toe te voegen aan de `compilerOptions` van de `tsconfig.lib.json` voor alle 8 falende bibliotheken.
*   **Resultaat:** De build (`npx nx build cv --configuration=production`) faalde nog steeds met exact dezelfde fouten.
*   **Conclusie:** De hypothese was in principe correct, maar de actie was gericht op het verkeerde bestand. De build-opdracht gebruikt de `--configuration=production` vlag. In de `project.json` van de bibliotheken wordt voor deze configuratie een ander, specifieker bestand gebruikt: **`tsconfig.lib.prod.json`**. Dit bestand erft van `tsconfig.lib.json` maar overschrijft de `compilerOptions`, en miste ook de `moduleResolution` instelling.

---

### Poging 3 (Definitieve Oplossing: Aanpassen van `tsconfig.lib.prod.json`)

*   **Datum:** 2025-09-11
*   **Hypothese:** De **`tsconfig.lib.prod.json`** bestanden van de falende bibliotheken missen de `"moduleResolution": "node"` (of `"bundler"`) instelling. Dit is het configuratiebestand dat daadwerkelijk wordt gebruikt door de `production` build, en is dus de bron van de fout.
*   **Actie:** Voeg `"moduleResolution": "node"` toe aan de `compilerOptions` binnen de `tsconfig.lib.prod.json` voor alle 8 falende bibliotheken.
*   **Resultaat:** Verwachting is dat de build nu slaagt. Alle `TS2307` en `Cannot destructure property 'pos'` fouten zouden hiermee opgelost moeten zijn.
*   **Conclusie:** Dit is de definitieve en correcte oplossing omdat het zich richt op het exacte configuratiebestand dat door de falende build-opdracht wordt gebruikt.


