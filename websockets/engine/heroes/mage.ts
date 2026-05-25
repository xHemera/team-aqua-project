const ID = "mage";

const PATH = `/gameResources/heroes/${ID}/assets`;

const portrait = `${PATH}/mage_icon.webp`;
const body = `${PATH}/mage_splash.webp`;
const chibi = `${PATH}/mage_chibi.webp`;
const spell1Icon = `${PATH}/spells/fire_spell.png`;
const spell2Icon = `${PATH}/spells/mana_replenish.png`;
const spell3Icon = `${PATH}/spells/counterspell.png`;

export const mage = {
  identity: {
    id: ID,
    name: "Mage",

    assets: {
      portrait: portrait,
      body: body,
      chibi: chibi,
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

        icon: spell1Icon,

        description:
          "Deals {multiplier}x Magical Damage + {flat} bonus Fire damage to a single target with a {burnChance}% chance to apply Burn for {duration} turns.",
      },

      unlockLevel: 1,
      manaCost: 12,

      scaling: [
        // [damageMultiplier, flatDamagePerLevel, burnChance, duration]
        [1.3, 18, 30, 1],
        [1.4, 22, 32, 1],
        [1.5, 26, 34, 1],
        [1.6, 30, 36, 1],
        [1.7, 34, 38, 1],
        [1.8, 38, 40, 2],
        [1.9, 43, 43, 2],
        [2.1, 50, 46, 2],
        [2.3, 58, 50, 3],
        [2.6, 70, 60, 3],
      ],
    },

    {
      id: "s2",

      type: "multiHitMagic",

      info: {
        name: "Arcane Missiles",

        icon: spell2Icon,

        description:
          "Launches {missiles} missiles, each dealing {multiplier}x Magical Damage to random enemies.",
      },

      unlockLevel: 8,
      manaCost: 16,

      scaling: [
        // [missileCount, damageMultiplier]
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

    {
      id: "s3",

      type: "ultimateAoe",

      info: {
        name: "Meteor",

        icon: spell3Icon,

        description:
          "Deals {multiplier}x Magical Damage + {flat} bonus damage to all enemies.",
      },

      unlockLevel: 15,
      manaCost: 20,

      scaling: [
        // [damageMultiplier, flatDamagePerLevel]
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
  ],
}
