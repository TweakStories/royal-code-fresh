import { Image, IUserStub } from "@royal-code/shared/domain";

export interface Profile extends IUserStub {
    email?: string;
    avatar?: Image;
    level?: number;
    reputation?: number;
    bio?: string;
  }
