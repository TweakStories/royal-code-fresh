import { AppIcon } from "@royal-code/shared/domain";

export interface Skill {
  name: string;
  icon: AppIcon; 
}

export interface SkillCategory {
  categoryNameKey: string;
  skills: Skill[];
}