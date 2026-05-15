/**
 * Centralized hero portrait mapping for teams and match history displays.
 * Ensures consistent hero-to-portrait mapping across the application.
 */

import { CHARACTERS } from "@/app/characters/character-roster";

export const TEAM_PORTRAITS: Record<string, string> = Object.fromEntries(
  CHARACTERS.map((character) => [character.name, character.portrait]),
);

export const getHeroPortrait = (heroName: string): string => {
  const fallbackPortrait = CHARACTERS[0]?.portrait ?? "/gameResources/heroes/knight/assets/avatar/Nautika_Garment1_Small_Icon.webp";
  return TEAM_PORTRAITS[heroName] || fallbackPortrait;
};
