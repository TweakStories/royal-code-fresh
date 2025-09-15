import { Guide } from '@royal-code/features/guides/domain';
import { MediaType } from '@royal-code/shared/domain';

// Verzonnen Product ID's voor de mock
const PROD_ID = {
  FOXEER_F722_V4: 'prod-foxeer-f722-v4',
  FOXEER_ELRS_RX: 'prod-foxeer-elrs-rx',
  UMMAGRIP_PAD: 'prod-ummagrip-pad',
  DJI_O4_PRO: 'prod-dji-o4-pro',
  SILICONE_WIRE_20AWG: 'prod-wire-20awg-black',
  RADIOMASTER_RANGER: 'prod-rm-ranger-elrs',
  SEQURE_USB_C: 'prod-sequre-usbc',
  LANDING_PAD: 'prod-landing-pad-75',
  HQPROP_5_2: 'prod-hqprop-52323',
  TBS_SOLDER: 'prod-tbs-solder',
  TBS_FLUX: 'prod-tbs-flux',
  RCINPOWER_GTS_V4: 'prod-rcinpower-gts-v4-1600kv',
  // Gereedschap
  TOOL_SOLDERING_IRON: 'tool-sq-001',
  TOOL_HEX_DRIVER_SET: 'tool-hex-drivers',
  TOOL_WIRE_STRIPPERS: 'tool-wire-strippers',
  TOOL_FLUSH_CUTTERS: 'tool-flushing-cutters',
  TOOL_MULTIMETER: 'tool-multimeter',
};

const guideData: Omit<Guide, 'totalSteps'>[] = [
  {
    id: 'guide-quadmula-siren-f5',
    slug: 'quadmula-siren-f5-dji-o4-build-guide',
    title: 'Quadmula Siren F5 Split-Deck met DJI O4 Pro - Bouwgids',
    description: 'Een complete, stapsgewijze gids voor de assemblage van de Quadmula Siren F5. We bouwen een krachtige 8S freestyle-quad, van het frame tot de Betaflight configuratie, met professionele tips en trucs.',
    coverImage: { id: 'img-siren-f5-cover', type: MediaType.IMAGE, variants: [{ url: 'images/default-image.webp' }], altText: 'Voltooide Quadmula Siren F5 drone op een landingsplatform' },
    difficulty: 'expert',
    estimatedMinutes: 240,
    requiredTools: [PROD_ID.TOOL_SOLDERING_IRON, PROD_ID.TOOL_HEX_DRIVER_SET, PROD_ID.TBS_SOLDER, PROD_ID.TBS_FLUX],
    includedParts: [PROD_ID.FOXEER_F722_V4, PROD_ID.FOXEER_ELRS_RX, PROD_ID.UMMAGRIP_PAD, PROD_ID.DJI_O4_PRO, PROD_ID.RCINPOWER_GTS_V4, PROD_ID.HQPROP_5_2],
    steps: [
      {
        id: 'step-1-prep',
        title: 'Voorbereiding en Inspectie',
        estimatedMinutes: 15,
        content: [
          { type: 'heading', level: 2, text: 'Inventarisatie' },
          { type: 'paragraph', content: 'Een goede voorbereiding is het halve werk. Leg alle onderdelen uit je kit en het benodigde gereedschap klaar op een schone, goed verlichte werkplek. Vergelijk de onderdelen met de lijsten hieronder om er zeker van te zijn dat alles compleet is.' },
          { type: 'partsList', partIds: [PROD_ID.FOXEER_F722_V4, PROD_ID.FOXEER_ELRS_RX, PROD_ID.DJI_O4_PRO, PROD_ID.RCINPOWER_GTS_V4] },
          { type: 'toolsList', toolIds: [PROD_ID.TOOL_SOLDERING_IRON, PROD_ID.TOOL_HEX_DRIVER_SET, PROD_ID.TBS_SOLDER, PROD_ID.TBS_FLUX] },
          { type: 'callout', style: 'pro-tip', content: 'Gebruik een schroevenbakje of een magnetische mat om te voorkomen dat je kleine boutjes kwijtraakt. Sorteer ze per lengte; dit bespaart je later veel tijd.' },
          { type: 'callout', style: 'warning', content: 'De randen van carbonfiber kunnen scherp zijn. Het is aan te raden de randen van de frame-onderdelen licht op te schuren met fijn schuurpapier om snijwonden te voorkomen en de duurzaamheid van je draden te vergroten.' },
        ]
      },
      {
        id: 'step-2-frame',
        title: 'Frame Assemblage',
        estimatedMinutes: 20,
        content: [
          { type: 'heading', level: 2, text: 'Basisframe Bouwen' },
          { type: 'paragraph', content: 'We beginnen met het monteren van de armen op de bodemplaat. De Quadmula Siren F5 heeft een "split-deck" ontwerp, wat betekent dat we eerst de onderste sectie compleet maken. Dit geeft ons een solide basis om de elektronica op te monteren.'},
          { type: 'image', image: { id: 'img-frame-assembly', type: MediaType.IMAGE, variants: [{url: 'images/default-image.webp'}], altText: 'Frame armen gemonteerd op de bodemplaat met standoffs' }, caption: 'Zorg ervoor dat de armen in de juiste oriëntatie zitten en de uitsparingen correct in elkaar grijpen.' },
          { type: 'paragraph', content: 'Plaats de M3 standoffs in de daarvoor bestemde gaten. Draai de bouten nog niet volledig vast! We doen dit pas nadat alle componenten zijn geplaatst, dit geeft ons wat speling tijdens de montage.' },
          { type: 'checklist', items: [
              { text: '4 armen gemonteerd op bodemplaat.' },
              { text: 'Standoffs geplaatst.' },
              { text: 'Bouten handvast aangedraaid.' }
          ]}
        ]
      },
      {
        id: 'step-3-motors',
        title: 'Motoren Installeren & Solderen',
        estimatedMinutes: 45,
        content: [
          { type: 'safetyGate', hazardType: 'solder', acknowledgementText: 'Ik begrijp de risico\'s van solderen, gebruik een soldeermat, werk in een goed geventileerde ruimte en draag een veiligheidsbril.' },
          { type: 'heading', level: 2, text: 'Motoren Monteren' },
          { type: 'paragraph', content: 'Monteer de Rcinpower motoren op de armen. Let op de draairichting die in Betaflight verwacht wordt (zie schema). De draadlengte moet ruim voldoende zijn om de 4-in-1 ESC in het midden van het frame te bereiken. Knip de draden nog niet op lengte.' },
          { type: 'image', image: { id: 'img-motor-direction', type: MediaType.IMAGE, variants: [{url: 'images/default-image.webp'}], altText: 'Betaflight motor draairichting schema' }, caption: 'Standaard Betaflight layout: Motor 1 is rechtsachter, Motor 2 rechtsvoor, etc.' },
          { type: 'callout', style: 'warning', content: 'Gebruik de juiste lengte motorbouten! Te lange bouten kunnen de motorwikkelingen in de stator raken, wat een kortsluiting en een defecte motor veroorzaakt.' },
          { type: 'heading', level: 2, text: 'Draden Voorbereiden en Solderen' },
          { type: 'paragraph', content: 'Strip ongeveer 2mm van elke motordraad en "vertin" de uiteinden door er een klein beetje soldeer op te smelten. Doe hetzelfde voor de motor-soldeerpads op de Foxeer 4-in-1 ESC. Gebruik een goede hoeveelheid flux voor een sterke, glanzende verbinding. Soldeer de draden aan de corresponderende pads.'},
          { type: 'checklist', items: [
            { text: 'Alle 12 motor-soldeerverbindingen zijn glanzend en stevig.' },
            { text: 'Geen "soldeerbruggen" tussen de pads.' },
          ]},
          { type: 'youtube', videoId: 'G-kZiR0_Q_A', title: 'Professioneel Solderen voor FPV Drones' }
        ]
      },
      {
        id: 'step-4-stack',
        title: 'FC & ESC Stack Installeren',
        estimatedMinutes: 20,
        content: [
          { type: 'paragraph', content: 'Plaats de rubberen dempers ("grommets") in de montagegaten van de 4-in-1 ESC. Monteer de ESC op de standoffs. Verbind vervolgens de Flight Controller (FC) bovenop de ESC met de meegeleverde kabelboom. Let goed op de pijl op zowel de FC als de ESC die de voorwaartse richting aangeeft.'},
          { type: 'image', image: { id: 'img-stack-install', type: MediaType.IMAGE, variants: [{url: 'images/default-image.webp'}], altText: 'FC/ESC stack gemonteerd in het frame' }, caption: 'De pijl op de FC moet naar voren wijzen. De accukabel wijst naar achteren.' },
          { type: 'callout', style: 'pro-tip', content: 'Controleer de pinout-diagrammen van de Foxeer F722 V4 en de DJI O4 Air Unit om zeker te zijn dat de draden van de kabelboom correct zijn aangesloten. Soms moeten pinnen in de connector worden omgewisseld. Dit is een cruciale stap om schade te voorkomen.' },
        ]
      },
      {
        id: 'step-5-vtx-rx',
        title: 'DJI O4 & ELRS Receiver Installatie',
        estimatedMinutes: 30,
        content: [
            { type: 'heading', level: 2, text: 'DJI O4 Air Unit Aansluiten' },
            { type: 'paragraph', content: 'Soldeer de kabelboom van de DJI O4 aan de FC. Verbind de stroomdraden (GND en 9V), en de UART-draden (TX en RX). Een gouden regel: de RX van de O4 gaat naar een TX-pad op de FC, en de TX van de O4 gaat naar een RX-pad op de FC (ze kruisen).'},
            { type: 'heading', level: 2, text: 'ELRS Receiver Aansluiten' },
            { type: 'paragraph', content: 'Soldeer de Foxeer ELRS receiver aan een andere vrije UART-poort op de FC. Verbind 5V, GND, TX en RX. Net als bij de VTX, de TX van de receiver gaat naar een RX-pad op de FC, en de RX van de receiver naar een TX-pad.'},
            { type: 'image', image: { id: 'img-wiring-diagram', type: MediaType.IMAGE, variants: [{url: 'images/default-image.webp'}], altText: 'Bedradingsschema voor FC, VTX en Receiver' }, caption: 'Voorbeeld bedradingsschema. Raadpleeg altijd de handleiding van je FC voor de juiste UARTs.' },
        ]
      },
       {
        id: 'step-6-final-assembly',
        title: 'Finale Assemblage',
        estimatedMinutes: 15,
        content: [
            { type: 'paragraph', content: 'Plaats de `Ummagrip` LiPo pad op de bovenplaat. Monteer de 3D-geprinte antennehouders voor de VTX en receiver antennes. Bevestig de bovenplaat en draai nu alle framebouten kruislings aan met de juiste inbussleutel.' },
            { type: 'callout', style: 'warning', content: 'VOER EEN KORTSLUITINGSTEST UIT! Gebruik een multimeter in continuïteitsmodus (piep-modus) om te controleren of er geen kortsluiting is tussen de plus- en min-pads van de accuaansluiting. Dit is de belangrijkste test voordat je de accu aansluit!' },
        ]
      },
      {
        id: 'step-7-betaflight',
        title: 'Betaflight Configuratie',
        estimatedMinutes: 60,
        content: [
          { type: 'heading', level: 2, text: 'Firmware & Basis Setup' },
          { type: 'paragraph', content: 'Download de laatste versie van de Betaflight Configurator. Verbind de FC met je computer. Maak in de CLI altijd eerst een backup van de standaard configuratie voordat je de firmware flasht.'},
          { type: 'code', language: 'cli', content: '# Maak eerst een backup van de standaard configuratie!\ndiff all' },
          { type: 'heading', level: 3, text: 'Poorten & Configuratie' },
          { type: 'paragraph', content: 'In de "Ports" tab, activeer "Serial RX" voor de UART waarop je de ELRS receiver hebt aangesloten. Voor de DJI O4, activeer "VTX (MSP)" op de corresponderende UART.'},
          { type: 'paragraph', content: 'In de "Configuration" tab, zet "Motor direction is reversed" aan. Selecteer DSHOT600 als ESC-protocol. Stel de PID-loop frequentie in op 8K/8K.'},
          { type: 'heading', level: 3, text: 'Receiver & VTX' },
          { type: 'paragraph', content: 'Selecteer "CRSF" als het receiver protocol. Ga naar de "Video Transmitter" tab, laad de VTX tabel voor de DJI O4, en stel je vermogen en kanaal in.'},
          { type: 'heading', level: 3, text: 'Modes & Failsafe' },
          { type: 'paragraph', content: 'Stel schakelaars in voor Arm, Angle mode, Beeper, en Flip Over After Crash in de "Modes" tab. Controleer in de "Failsafe" tab of deze correct is ingesteld op "Drop".'},
        ]
      },
      {
        id: 'step-8-preflight',
        title: 'Pre-Flight Checks & Maiden',
        estimatedMinutes: 15,
        content: [
          { type: 'safetyGate', hazardType: 'props', acknowledgementText: 'Ik bevestig dat alle propellers van de drone zijn verwijderd voordat ik de accu aansluit.' },
          { type: 'paragraph', content: 'Met de propellers verwijderd, sluit je de 8S Tattu LiPo aan (bij voorkeur met een "smokestopper"). Controleer in de "Motors" tab van Betaflight of elke motor correct reageert en in de juiste richting draait zoals in het schema.'},
          { type: 'checklist', items: [
              { text: 'Failsafe getest (radio uitzetten en controleren of motoren stoppen).' },
              { text: 'Alle bouten zijn aangedraaid.' },
              { text: 'Antennes zijn correct gemonteerd en vrij van de propellers.' },
          ]},
          { type: 'paragraph', content: 'Installeer de HQProp propellers. LET OP: zorg ervoor dat de draairichting van de propellers overeenkomt met de motorrichting! Zoek een veilig, open veld voor je eerste vlucht (maiden). Begin met een korte hover om te controleren op ongewone trillingen. Gefeliciteerd, je hebt je drone gebouwd!' },
        ]
      },
    ]
  },
  {
    id: 'guide-solder',
    slug: 'solder-guide', // << DE FIX: Slug toegevoegd
    title: 'De Complete Soldeergids voor FPV Drones',
    description: 'Leer de essentiële soldeertechnieken die elke FPV bouwer moet kennen. Van het kiezen van het juiste gereedschap tot perfecte, duurzame verbindingen.',
    coverImage: { id: 'img-solder-guide', type: MediaType.IMAGE, variants: [{ url: 'images/default-image.webp' }], altText: 'Soldeerbout op een PCB' },
    difficulty: 'beginner',
    estimatedMinutes: 60,
    requiredTools: [PROD_ID.TOOL_SOLDERING_IRON, PROD_ID.TBS_SOLDER, PROD_ID.TBS_FLUX],
    includedParts: [PROD_ID.SILICONE_WIRE_20AWG],
    steps: [
      {
        id: 'solder-step-1',
        title: 'Gereedschap & Materialen',
        estimatedMinutes: 10,
        content: [
          { type: 'heading', level: 2, text: 'Wat Heb Je Nodig?' },
          { type: 'paragraph', content: 'Voordat je begint, zorg ervoor dat je de juiste gereedschappen en materialen bij de hand hebt. Kwaliteitsgereedschap maakt het proces veiliger en eenvoudiger.' },
          { type: 'toolsList', toolIds: [PROD_ID.TOOL_SOLDERING_IRON, PROD_ID.TBS_SOLDER, PROD_ID.TBS_FLUX], introText: 'Essentieel gereedschap:' },
          { type: 'callout', style: 'pro-tip', content: 'Investeer in een goede soldeerbout met temperatuurregeling. Dit voorkomt oververhitting van componenten.' },
        ]
      },
      {
        id: 'solder-step-2',
        title: 'Technieken: Vertinnen & Verbindingen',
        estimatedMinutes: 20,
        content: [
          { type: 'safetyGate', hazardType: 'solder', acknowledgementText: 'Ik begrijp dat soldeerdampen schadelijk kunnen zijn en dat ik een geventileerde ruimte moet gebruiken en een veiligheidsbril moet dragen.' },
          { type: 'heading', level: 2, text: 'Vertinnen van Draden en Pads' },
          { type: 'paragraph', content: 'Vertinnen ("tinning") is cruciaal voor sterke soldeerverbindingen. Smelt een beetje soldeer op de gestripte draad en de soldeerpads op je PCB. Dit zorgt voor een betere hechting.' },
          { type: 'youtube', videoId: 'Yvj-R-uU8pE', title: 'Soldeer Draden en Pads Vertinnen' },
          { type: 'heading', level: 3, text: 'De Perfecte Soldeerverbinding' },
          { type: 'paragraph', content: 'Verwarm zowel de pad als de draad tegelijkertijd, voeg soldeer toe aan het raakpunt, en haal eerst het soldeer weg en dan de bout. Het resultaat moet glanzend en kegelvormig zijn.' },
          { type: 'checklist', items: [
              { text: 'Draden en pads zijn voor-vertind.' },
              { text: 'Soldeerverbindingen zijn glanzend.' },
              { text: 'Geen koude (matte) verbindingen.' }
          ]}
        ]
      }
    ]
  }
];

// Dynamisch totalSteps berekenen voor elke gids in de array
export const MOCK_GUIDES: Guide[] = guideData.map(guide => ({
  ...guide,
  totalSteps: guide.steps.length,
}));