// libs/features/social/src/lib/social.routes.ts
import { Route } from '@angular/router';

export const socialFeatureRoutes: Route[] = [
  {
    path: '',
    // Providers array is alleen nodig als je de state *lazy* laadt met deze route.
    // Als je SocialState *eager* laadt in app.config.ts, dan kan deze providers array hier leeg zijn
    // of zelfs helemaal weggelaten worden als de route geen eigen specifieke providers nodig heeft.
    providers: [
        // Als SocialState eager geladen wordt (in app.config.ts), dan is deze provideSocialFeature() hier NIET nodig.
        // Als SocialState lazy geladen moet worden met deze /social route, dan MOET het hier staan.
        // Voor nu, aannemend dat je het eager wilt (omdat chat overal werkt):
        // provideSocialFeature() // << VERWIJDEREN ALS EAGER GELADEN IN APP.CONFIG.TS
    ],
    children: [
      // Voorbeeld:
      // { path: '', component: SocialDashboardComponent },
      // { path: 'feed', component: FeedPageComponent }, // Als FeedComponent een paginacomponent is
      // { path: 'chat', component: ChatPageComponent }, // Als je een aparte chat pagina hebt
      // Voor nu leeg, omdat FeedComponent en ChatOverlayComponent elders gebruikt worden.
      // Misschien een default redirect?
      // { path: '', redirectTo: 'feed', pathMatch: 'full' } // indien van toepassing
    ]
  }
];