export type DefaultDeckCard = {
  name: string;
  count: number;
};

export type DefaultDeck = {
  title: "Toxtricity" | "Zacian" | "Flygon" | "Ceruledge";
  image: string;
  cards: DefaultDeckCard[];
};

export const DEFAULT_DECKS: DefaultDeck[] = [
  {
    title: "Toxtricity",
    image: "/decks/toxtricity-icon.png",
    cards: [
      { name: "sandile", count: 3 },
      { name: "krokorok", count: 3 },
      { name: "krookodile", count: 3 },
      { name: "toxel", count: 2 },
      { name: "toxtricity", count: 3 },
      { name: "absol", count: 2 },
      { name: "grimsley_move", count: 3 },
      { name: "lillie_determination", count: 3 },
      { name: "brock_scouting", count: 2 },
      { name: "rare_candy", count: 2 },
      { name: "dusk_ball", count: 2 },
      { name: "switch", count: 1 },
      { name: "energy_recycler", count: 1 },
      { name: "darkness_energy", count: 12 },
    ],
  },
  {
    title: "Zacian",
    image: "/decks/zacian-icon.png",
    cards: [
      { name: "milcery", count: 4 },
      { name: "alcremie", count: 4 },
      { name: "zacian", count: 3 },
      { name: "mimikyu", count: 1 },
      { name: "lillie_determination", count: 3 },
      { name: "hilda", count: 2 },
      { name: "brock_scouting", count: 2 },
      { name: "drayton", count: 2 },
      { name: "iris_fighting_spirit", count: 1 },
      { name: "ultra_ball", count: 2 },
      { name: "wondrous_patch", count: 2 },
      { name: "switch", count: 1 },
      { name: "psychic_energy", count: 13 },
    ],
  },
  {
    title: "Flygon",
    image: "/decks/flygon-icon.png",
    cards: [
      { name: "trapinch", count: 4 },
      { name: "vibrava", count: 2 },
      { name: "flygon", count: 3 },
      { name: "gligar", count: 2 },
      { name: "gliscor", count: 2 },
      { name: "lillie_determination", count: 3 },
      { name: "hilda", count: 2 },
      { name: "dawn", count: 2 },
      { name: "rare_candy", count: 2 },
      { name: "fighting_gong", count: 2 },
      { name: "dusk_ball", count: 2 },
      { name: "premium_power_pro", count: 2 },
      { name: "switch", count: 1 },
      { name: "fighting_energy", count: 11 },
    ],
  },
  {
    title: "Ceruledge",
    image: "/decks/ceruledge-icon.png",
    cards: [
      { name: "charcadet", count: 4 },
      { name: "ceruledge", count: 4 },
      { name: "moltres", count: 1 },
      { name: "firebreather", count: 3 },
      { name: "hilda", count: 3 },
      { name: "lillie_determination", count: 2 },
      { name: "energy_retrieval", count: 4 },
      { name: "ultra_ball", count: 2 },
      { name: "switch", count: 1 },
      { name: "fire_energy", count: 16 },
    ],
  },
];
