// libs/features/character-progression/src/lib/state/character-progression.facade.ts
/**
 * @fileoverview Facade for the Character Progression feature.
 * Provides a simplified API for components to interact with the character progression state,
 * including selecting data (stats, definitions, lifeskills, skills) and dispatching actions.
 * @version 1.2.0
 * @author ChallengerAppDevAI
 */
import { Injectable, inject, Signal, computed } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

import { CharacterProgressionActions } from './character-progression.actions';
import * as CharacterProgressionSelectors from './character-progression.selectors';
import { CharacterProgressionState } from './character-progression.state';
import {
  CharacterStats, StatDefinition, Lifeskill, SkillDefinition, UserSkill, SkillId, SkillDisplay, StatBarInput, StatCategory,
  StatType
} from '@royal-code/shared/domain';
import { LoggerService } from '@royal-code/core/core-logging';
import { SkillCategorySummary } from '../components/skills/skill-category-card/skill-category-card.component';
import { CharacterStatDisplayItem } from './character-progression.types';

/**
 * @Injectable CharacterProgressionFacade
 * @providedIn 'root'
 * @description Abstraction layer for character progression state management.
 */
@Injectable({ providedIn: 'root' })
export class CharacterProgressionFacade {
  // --- Injected Dependencies ---
  private store = inject(Store<CharacterProgressionState>); // Typed store for better safety
  private logger = inject(LoggerService);
  /** @const {string} logPrefix - Consistent prefix for log messages. */
  private readonly logPrefix = '[CharProgressionFacade]';

  // --- Core Stats & Definitions ---
  /** Signal emitting the current character's core statistics, or null. */
  readonly stats: Signal<CharacterStats | null> = toSignal(
    this.store.pipe(select(CharacterProgressionSelectors.selectCharacterStats)),
    { initialValue: null }
  );
  /** Signal emitting an array of static stat definitions. */
  readonly statDefinitions: Signal<StatDefinition[]> = toSignal(
    this.store.pipe(select(CharacterProgressionSelectors.selectStatDefinitions)),
    { initialValue: [] }
  );
   /** Signal indicating if core stats are currently loading. */
   readonly isLoadingStats: Signal<boolean> = toSignal(
    this.store.pipe(select(CharacterProgressionSelectors.selectCharacterStatsLoading)),
    { initialValue: false }
  );
  /** Signal indicating if stat definitions are currently loading. */
  readonly isLoadingDefinitions: Signal<boolean> = toSignal(
    this.store.pipe(select(CharacterProgressionSelectors.selectStatDefinitionsLoading)),
    { initialValue: false }
  );

  // --- Lifeskills ---
  /** Signal emitting an array of the user's current lifeskills. */
  readonly lifeskills: Signal<Lifeskill[]> = toSignal(
    this.store.pipe(select(CharacterProgressionSelectors.selectLifeskills)),
    { initialValue: [] }
  );
  /** Signal indicating if lifeskills are currently loading. */
  readonly isLoadingLifeskills: Signal<boolean> = toSignal(
    this.store.pipe(select(CharacterProgressionSelectors.selectLifeskillsLoading)),
    { initialValue: false }
  );

  // --- Skills & Skill Definitions ---
  /** Signal emitting all available static skill definitions. */
  readonly skillDefinitions: Signal<SkillDefinition[]> = toSignal(
    this.store.pipe(select(CharacterProgressionSelectors.selectSkillDefinitions)),
    { initialValue: [] }
  );
  /** Signal emitting the user's current progression for all skills. */
  readonly userSkills: Signal<UserSkill[]> = toSignal(
    this.store.pipe(select(CharacterProgressionSelectors.selectUserSkills)),
    { initialValue: [] }
  );
  /** Signal indicating if skill-related data (definitions or user progression) is loading. */
  readonly isLoadingSkills: Signal<boolean> = toSignal(
    this.store.pipe(select(CharacterProgressionSelectors.selectSkillsLoading)),
    { initialValue: false }
  );
  /** Signal emitting combined skill data (definitions + user progress) for UI display. */
  readonly skillsForDisplay: Signal<SkillDisplay[]> = toSignal(
    this.store.pipe(select(CharacterProgressionSelectors.selectSkillsForDisplay)),
    { initialValue: [] }
  );

  // --- General Loading & Error ---
  /** Signal indicating if any character progression data is currently loading. */
  readonly isLoading: Signal<boolean> = toSignal(
    this.store.pipe(select(CharacterProgressionSelectors.selectAnyProgressionLoading)),
    { initialValue: false }
  );
  /** Signal holding the last character progression error message, or null. */
  readonly error: Signal<string | null> = toSignal(
    this.store.pipe(select(CharacterProgressionSelectors.selectCharacterProgressionError)),
    { initialValue: null }
  );

  // --- Combined Display Data ---
  /** Signal for displaying core stats with their UI bar configurations. */
  readonly statsForDisplay: Signal<CharacterStatDisplayItem[]> = toSignal(
    this.store.pipe(select(CharacterProgressionSelectors.selectCharacterStatsForDisplay)),
    { initialValue: [] }
  );
  /** Signal for displaying stats categorized for detailed views. */
  readonly categorizedStatsForDisplay: Signal<StatCategory[]> = toSignal(
    this.store.pipe(select(CharacterProgressionSelectors.selectCategorizedStatsForDisplay)),
    { initialValue: [] }
  );

  readonly skillCategorySummaries: Signal<SkillCategorySummary[]> = toSignal(
    // Zorg dat de selector hier ook de nieuwe, generieke naam heeft als je die hebt aangepast
    this.store.pipe(select(CharacterProgressionSelectors.selectSkillCategorySummaries)), // Of selectSkillCategorySummaries
    { initialValue: [] }
  );


  // --- Specifiek voor UI Stat Bar Component (voor core stats) ---
  /** Factory method to create a Signal for StatBarInput configuration for a given StatType. */
  private createStatBarConfig(
    statType: StatType,
    currentValueFn: () => number | undefined,
    maxValueFn: () => number | undefined,
    labelKey?: string,
    overrideUiSegments?: number
  ): Signal<StatBarInput | undefined> {
    return computed(() => {
      const currentStats = this.stats();
      const definitions = this.statDefinitions();
      const definition = definitions.find(def => def.id === statType);
      const currentValue = currentValueFn();
      let maxValue = maxValueFn();

      if (maxValue === undefined && definition) maxValue = definition.maxValue;
      if (!definition || currentValue === undefined || maxValue === undefined || maxValue <= 0) return undefined;

      const totalUiSegments = overrideUiSegments ?? definition.uiSegments;
      let filledCountForBar: number;
      if (totalUiSegments === maxValue) filledCountForBar = Math.max(0, Math.min(currentValue, totalUiSegments));
      else if (maxValue > 0) {
          const percentageFilled = currentValue / maxValue;
          filledCountForBar = Math.round(percentageFilled * totalUiSegments);
          filledCountForBar = Math.max(0, Math.min(filledCountForBar, totalUiSegments));
      } else filledCountForBar = 0;

      return {
        filledCount: filledCountForBar,
        totalSegments: totalUiSegments,
        barLabel: labelKey,
        barIcon: definition.barIcon || definition.icon,
        resourceType: `attribute_${statType.toLowerCase()}` // Voor specifieke styling
      };
    });
  }

  /** Signal for Strength bar configuration. */
  readonly strengthBarConfig$: Signal<StatBarInput | undefined> = this.createStatBarConfig(
    StatType.Strength, () => this.stats()?.strength, () => this.statDefinitions().find(d => d.id === StatType.Strength)?.maxValue
  );
  /** Signal for Dexterity bar configuration. */
  readonly dexterityBarConfig$: Signal<StatBarInput | undefined> = this.createStatBarConfig(
    StatType.Dexterity, () => this.stats()?.dexterity, () => this.statDefinitions().find(d => d.id === StatType.Dexterity)?.maxValue
  );
  /** Signal for Intelligence bar configuration. */
  readonly intelligenceBarConfig$: Signal<StatBarInput | undefined> = this.createStatBarConfig(
    StatType.Intelligence, () => this.stats()?.intelligence, () => this.statDefinitions().find(d => d.id === StatType.Intelligence)?.maxValue
  );
  /** Signal for Luck bar configuration. */
  readonly luckBarConfig$: Signal<StatBarInput | undefined> = this.createStatBarConfig(
    StatType.Luck, () => this.stats()?.luck, () => this.statDefinitions().find(d => d.id === StatType.Luck)?.maxValue
  );
  /** Signal for Arcane bar configuration. */
  readonly arcaneBarConfig$: Signal<StatBarInput | undefined> = this.createStatBarConfig(
    StatType.Arcane, () => this.stats()?.arcane, () => this.statDefinitions().find(d => d.id === StatType.Arcane)?.maxValue
  );

  // --- Action Dispatchers ---

  /** Dispatches an action to load core character statistics. */
  loadCharacterStats(): void {
    this.logger.info(`${this.logPrefix} Dispatching Load Character Stats Requested`);
    this.store.dispatch(CharacterProgressionActions.loadCharacterStatsRequested());
  }

  /** Dispatches an action to load static stat definitions. */
  loadStatDefinitions(): void {
    this.logger.info(`${this.logPrefix} Dispatching Load Stat Definitions Requested`);
    this.store.dispatch(CharacterProgressionActions.loadStatDefinitionsRequested());
  }

  /** Dispatches an action to load user's lifeskill progression. */
  loadLifeskills(): void {
    this.logger.info(`${this.logPrefix} Dispatching Load Lifeskills Requested`);
    this.store.dispatch(CharacterProgressionActions.loadLifeskillsRequested());
  }

  /** Dispatches an action to update character statistics. */
  updateCharacterStats(statsChanges: Partial<CharacterStats>): void {
    this.logger.info(`${this.logPrefix} Dispatching Update Character Stats Requested`, { statsChanges });
    this.store.dispatch(CharacterProgressionActions.updateCharacterStatsRequested({ statsChanges }));
  }

  /** Dispatches an action to load all available skill definitions. */
  loadSkillDefinitions(): void {
    this.logger.info(`${this.logPrefix} Dispatching Load Skill Definitions Requested`);
    this.store.dispatch(CharacterProgressionActions.loadSkillDefinitionsRequested());
  }

  /** Dispatches an action to load the current user's skill progression data. */
  loadUserSkills(): void {
    this.logger.info(`${this.logPrefix} Dispatching Load User Skills Requested`);
    this.store.dispatch(CharacterProgressionActions.loadUserSkillsRequested());
  }

  /** Dispatches an action for the user to learn (add) a new skill. */
  addUserSkill(skillId: SkillId, initialLevel?: number): void {
    this.logger.info(`${this.logPrefix} Dispatching Add User Skill Requested for: ${skillId}`);
    this.store.dispatch(CharacterProgressionActions.addUserSkillRequested({ skillId, initialLevel }));
  }

  /** Dispatches an action for the user to upgrade an existing skill. */
  upgradeSkill(skillId: SkillId): void {
    this.logger.info(`${this.logPrefix} Dispatching Upgrade Skill Requested for: ${skillId}`);
    this.store.dispatch(CharacterProgressionActions.upgradeSkillRequested({ skillId }));
  }

  /** Dispatches an action for the user to "forget" (delete) a learned skill. */
  deleteUserSkill(skillId: SkillId): void {
    this.logger.info(`${this.logPrefix} Dispatching Delete User Skill Requested for: ${skillId}`);
    this.store.dispatch(CharacterProgressionActions.deleteUserSkillRequested({ skillId }));
  }

  /** Dispatches an action to clear any character progression error messages. */
  clearError(): void {
    this.logger.info(`${this.logPrefix} Dispatching Clear Character Progression Error`);
    this.store.dispatch(CharacterProgressionActions.clearCharacterProgressionError());
  }
}
