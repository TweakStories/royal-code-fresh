import { Injectable } from '@angular/core';
import { AppIcon } from '@royal-code/shared/domain'; // Zorg dat paden kloppen
import { ButtonType } from '@royal-code/ui/button';

// Interface voor de configuratie van een enkele navigatiekaart
export interface NavCardConfigItem {
  id: string; // Unieke ID voor trackBy
  iconName?: AppIcon;
  titleKey: string;
  descriptionKey: string;
  routePath?: string | string[];
  externalLink?: string;
  buttonTextKey?: string; // Default wordt in de component afgehandeld
  buttonType?: ButtonType;  // Default wordt in de component afgehandeld
  extraCardClasses?: string;
}

@Injectable({
  providedIn: 'root' // Maak de service beschikbaar in de hele 'cv' applicatie
                     // Als je de 'cv' app als een feature module laadt, kun je ook overwegen
                     // om het daar te providen als het niet globaal nodig is.
})
export class CvConfigService {

  private readonly homepageNavigationCards: NavCardConfigItem[] = [
    {
      id: 'skills',
      iconName: AppIcon.Gauge, // Voorbeeld, pas aan naar je daadwerkelijke AppIcon enum
      titleKey: 'cv.home.cards.skills.title',
      descriptionKey: 'cv.home.cards.skills.description',
      routePath: '/cv/skills-tools', // Pas aan naar de daadwerkelijke route in je CV app
      buttonTextKey: 'cv.home.cards.skills.cta', // Optioneel, anders pakt het de default van de component
      buttonType: 'primary',
    },
    {
      id: 'projects',
      iconName: AppIcon.Package,
      titleKey: 'cv.home.cards.projects.title', // Moet bestaan in nl.json etc.
      descriptionKey: 'cv.home.cards.projects.description', // Moet bestaan in nl.json etc.
      routePath: '/cv/projects',
      buttonType: 'primary',
      buttonTextKey: 'common.buttons.viewDetails' // Moet bestaan in nl.json etc.
    },
    {
      id: 'experience',
      iconName: AppIcon.Briefcase, // Je zult 'Briefcase' moeten toevoegen aan je AppIcon enum
      titleKey: 'cv.home.cards.experience.title',
      descriptionKey: 'cv.home.cards.experience.description',
      routePath: '/cv/experience',
      buttonType: 'primary',
    },
    {
      id: 'contact',
      iconName: AppIcon.Mail, // Je zult 'Mail' moeten toevoegen aan je AppIcon enum
      titleKey: 'cv.home.cards.contact.title',
      descriptionKey: 'cv.home.cards.contact.description',
      routePath: '/cv/contact',
      buttonType: 'primary',
    },
    {
      id: 'miniGame',
      iconName: AppIcon.Gamepad2, // Je zult 'Gamepad2' of iets dergelijks moeten toevoegen
      titleKey: 'cv.home.cards.miniGame.title',
      descriptionKey: 'cv.home.cards.miniGame.description',
      routePath: '/cv/mini-game', // Of een externe link als je het apart host
      buttonType: 'primary',
    },
    // Voeg hier meer kaarten toe als nodig
  ];

  private readonly skillsData = [ /* ... je skill data hier ... */ ];
  // ... andere statische data voor je CV ...

  constructor() { }

  /**
   * Haalt de configuratie op voor de navigatiekaarten op de homepage.
   * @returns Een array van NavCardConfigItem objecten.
   */
  getHomepageNavigationCards(): NavCardConfigItem[] {
    // In de toekomst zou je hier logica kunnen toevoegen om kaarten conditioneel
    // te tonen, maar voor nu geven we gewoon de hardgecodeerde lijst terug.
    return this.homepageNavigationCards;
  }

  // Voorbeeld voor skills data (analoog aan de navigatiekaarten)
  // getSkills(): CvSkill[] {
  //   return this.skillsData;
  // }

  // Voeg hier andere methodes toe om andere statische CV data op te halen
}