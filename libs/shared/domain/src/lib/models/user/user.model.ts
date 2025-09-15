// libs/features/users/src/lib/models/users.model.ts

import { ApplicationSettings } from "./user-application-settings";


  export interface User {
    id: string;
    name: string;
    email: string;
    applicationSettings: ApplicationSettings;
  }
