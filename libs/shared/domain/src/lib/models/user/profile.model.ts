import { IUserStub } from "./user-stub.model";
import { Image } from "../media/media.model";

export interface Profile extends IUserStub {
    email?: string;
    avatar?: Image;
    level?: number;
    reputation?: number;
    bio?: string;
  }
