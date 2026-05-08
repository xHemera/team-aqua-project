export const healer = {
  identity: {
    id: "healer",
    name: "Healer",

    assets: {
      portrait: "gameResources/heroes/{_id}/assets/avatar/{_id}.webp",
      body: "gameResources/heroes/{_id}/assets/body/{_id}.webp",
    },
  },

  baseStats: {
    physicalDamage: 65,
    magicalDamage: 155,

    critChance: 8,
    critDamage: 150,

    hp: 1380,
    mp: 320,

    physicalResistance: 9,
    magicalResistance: 14,

    speed: 95,
  },

  growth: {
    physicalDamage: 3,
    magicalDamage: 10,

    critChance: 1,
    critDamage: 2,

    hp: 9,
    mp: 10,

    physicalResistance: 2,
    magicalResistance: 4,

    speed: 1,
  },

  skills: [
    {
      id: "s1",

      type: "singleHeal",

      info: {
        name: "Healing Light",

        icon: "/spells/healing_spell.png",

        description:
          "Restores {multiplier}x Magical Damage + {flat} bonus HP to a single ally.",
      },

      unlockLevel: 1,
      manaCost: 10,

      scaling: {
        stat: "magicalDamage",

        // [healMultiplier, flatHealPerLevel]
        ranks: [
          [0.6, 25],
          [0.7, 30],
          [0.8, 35],
          [0.9, 40],
          [1.0, 45],
          [1.1, 50],
          [1.2, 56],
          [1.35, 64],
          [1.5, 72],
          [1.7, 85],
        ],
      },
    },

    {
      id: "s2",

      type: "aoeHealBuff",

      info: {
        name: "Sanctuary",

        icon: "/spells/defense_boost.png",

        description:
          "Heals all allies for {multiplier}x Magical Damage + {flat} bonus HP and grants +{defenseBonus}% Defense for {duration} turns.",
      },

      unlockLevel: 7,
      manaCost: 18,

      scaling: {
        stat: "magicalDamage",

        // [healMultiplier, flatHealPerLevel, defenseBonus, duration]
        ranks: [
          [0.4, 15, 3, 2],
          [0.5, 18, 4, 2],
          [0.6, 21, 5, 2],
          [0.7, 24, 6, 2],
          [0.8, 28, 7, 2],
          [0.9, 32, 8, 3],
          [1.0, 36, 10, 3],
          [1.15, 42, 12, 3],
          [1.3, 50, 15, 4],
          [1.5, 60, 20, 4],
        ],
      },
    },

    {
      id: "s3",

      type: "invulnerability",

      info: {
        name: "Divine Protection",

        icon: "/spells/divine_protection_spell.png",

        description:
          "Target ally becomes immune to all damage for {duration} turn(s).",
      },

      unlockLevel: 14,
      manaCost: 35,

      scaling: {
        // [duration]
        ranks: [
          [1],
          [1],
          [1],
          [1],
          [1],
          [1],
          [1],
          [1],
          [1],
          [2],
        ],
      },
    },
  ],
}
