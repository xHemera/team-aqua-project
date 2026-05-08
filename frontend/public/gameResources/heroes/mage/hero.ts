export const mage = {
  identity: {
    id: "mage-1",
    name: "Mage",

    assets: {
      portrait: "gameResources/heroes/{_id}/assets/avatar/{_id}.webp",
      body: "gameResources/heroes/{_id}/assets/body/{_id}.webp",
    },
  },

  baseStats: {
    physicalDamage: 55,
    magicalDamage: 185,

    critChance: 15,
    critDamage: 180,

    hp: 980,
    mp: 380,

    physicalResistance: 7,
    magicalResistance: 16,

    speed: 102,
  },

  growth: {
    physicalDamage: 2,
    magicalDamage: 12,

    critChance: 2,
    critDamage: 5,

    hp: 6,
    mp: 12,

    physicalResistance: 1,
    magicalResistance: 4,

    speed: 2,
  },

  skills: [
    {
      id: "s1",

      type: "burnDamage",

      info: {
        name: "Fireball",

        icon: "/spells/fire_spell.png",

        description:
          "Deals {multiplier}x Magical Damage + {flat} bonus Fire damage to a single target with a {burnChance}% chance to apply Burn.",
      },

      unlockLevel: 1,
      manaCost: 12,

      scaling: {
        stat: "magicalDamage",

        // [damageMultiplier, flatDamagePerLevel, burnChance]
        ranks: [
          [1.3, 18, 30],
          [1.4, 22, 32],
          [1.5, 26, 34],
          [1.6, 30, 36],
          [1.7, 34, 38],
          [1.8, 38, 40],
          [1.9, 43, 43],
          [2.1, 50, 46],
          [2.3, 58, 50],
          [2.6, 70, 60],
        ],
      },
    },

    {
      id: "s2",

      type: "multiHitMagic",

      info: {
        name: "Arcane Missiles",

        icon: "/spells/mana_replenish.png",

        description:
          "Launches {missiles} missiles, each dealing {multiplier}x Magical Damage to random enemies.",
      },

      unlockLevel: 8,
      manaCost: 16,

      scaling: {
        stat: "magicalDamage",

        // [missileCount, damageMultiplier]
        ranks: [
          [2, 1.5],
          [2, 1.6],
          [3, 1.6],
          [3, 1.7],
          [4, 1.7],
          [4, 1.8],
          [5, 1.8],
          [5, 1.9],
          [6, 2.0],
          [7, 2.1],
        ],
      },
    },

    {
      id: "s3",

      type: "ultimateAoe",

      info: {
        name: "Meteor",

        icon: "/spells/counterspell.png",

        description:
          "Deals {multiplier}x Magical Damage + {flat} bonus damage to all enemies.",
      },

      unlockLevel: 15,
      manaCost: 20,

      scaling: {
        stat: "magicalDamage",

        // [damageMultiplier, flatDamagePerLevel]
        ranks: [
          [2.2, 40],
          [2.4, 45],
          [2.6, 50],
          [2.8, 55],
          [3.0, 60],
          [3.2, 66],
          [3.5, 74],
          [3.8, 84],
          [4.2, 96],
          [4.8, 115],
        ],
      },
    },
  ],
}
