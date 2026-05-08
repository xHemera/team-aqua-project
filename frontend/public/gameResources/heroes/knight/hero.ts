export const knight = {
  identity: {
    id: "knight",
    name: "Knight",

    assets: {
      portrait: "gameResources/heroes/{_id}/assets/avatar/{_id}.webp",
      body: "gameResources/heroes/{_id}/assets/body/{_id}.webp",
    },
  },

  baseStats: {
    physicalDamage: 145,
    magicalDamage: 55,

    critChance: 10,
    critDamage: 155,

    hp: 2180,
    mp: 120,

    physicalResistance: 20,
    magicalResistance: 12,

    speed: 88,
  },

  growth: {
    physicalDamage: 7,
    magicalDamage: 3,

    critChance: 1,
    critDamage: 2,

    hp: 14,
    mp: 3,

    physicalResistance: 5,
    magicalResistance: 3,

    speed: 1,
  },

  skills: [
    {
      id: "s1",

      type: "stunDamage",

      info: {
        name: "Shield Bash",

        icon: "/spells/fortify_spell.png",

        description:
          "Deals {multiplier}x Physical Damage + {flat} bonus damage and has a {stunChance}% chance to Stun for {duration} turn(s).",
      },

      unlockLevel: 1,
      manaCost: 12,

      scaling: {
        stat: "physicalDamage",

        // [damageMultiplier, flatDamagePerLevel, stunChance, stunDuration]
        ranks: [
          [1.1, 18, 20, 1],
          [1.2, 21, 23, 1],
          [1.3, 24, 26, 1],
          [1.4, 28, 29, 1],
          [1.5, 32, 32, 1],
          [1.6, 36, 35, 1],
          [1.7, 40, 38, 1],
          [1.8, 45, 42, 1],
          [2.0, 52, 48, 2],
          [2.2, 60, 55, 2],
        ],
      },
    },

    {
      id: "s2",

      type: "tauntDefenseBuff",

      info: {
        name: "Iron Will",

        icon: "/spells/attack_boost.png",

        description:
          "Taunts all enemies and reduces damage taken by {damageReduction}% for {duration} turns.",
      },

      unlockLevel: 5,
      manaCost: 15,

      scaling: {
        // [damageReduction, duration]
        ranks: [
          [10, 2],
          [14, 2],
          [18, 2],
          [22, 2],
          [26, 2],
          [30, 3],
          [35, 3],
          [40, 3],
          [46, 4],
          [55, 4],
        ],
      },
    },

    {
      id: "s3",

      type: "emergencyShield",

      info: {
        name: "Last Stand",

        icon: "/spells/on_fire_(burning).png",

        description:
          "When HP drops below {hpThreshold}%, automatically gain a shield equal to {shieldPercent}% of Max HP. Triggers once per battle.",
      },

      unlockLevel: 15,
      manaCost: 25,

      scaling: {
        // [hpThreshold, shieldPercent]
        ranks: [
          [30, 15],
          [30, 18],
          [30, 21],
          [30, 24],
          [35, 27],
          [35, 30],
          [35, 34],
          [40, 38],
          [40, 43],
          [45, 50],
        ],
      },
    },
  ],
}
