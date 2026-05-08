/**
 * Centralized hero portrait mapping for teams and match history displays.
 * Ensures consistent hero-to-portrait mapping across the application.
 */

export const TEAM_PORTRAITS: Record<string, string> = {
  Knight: "/heroes/Avatar_Sorel.webp",
  Assassin: "/heroes/Avatar_Wanda.webp",
  Healer: "/heroes/Avatar_Tulu.webp",
  Archer: "/heroes/Avatar_Uvhash.webp",
  Mage: "/heroes/Avatar_Thais.webp",
};

export const getHeroPortrait = (heroName: string): string => {
  return TEAM_PORTRAITS[heroName] || TEAM_PORTRAITS.Knight;
};
