const ID = "knight";

const PATH = `/gameResources/heroes/${ID}/assets`;

const portrait = `${PATH}/avatar/Nautika_Garment1_Small_Icon.webp`;
const body = `${PATH}/body/Nautika_Garment1.webp`;
const spell1Icon = `${PATH}/spells/fortify_spell.png`;
const spell2Icon = `${PATH}/spells/attack_boost.png`;
const spell3Icon = `${PATH}/spells/on_fire_(burning).png`;

export const knight = {
  identity: {
    id: ID,
    name: "Knight",

    assets: {
      portrait: portrait,
      body: body,
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

        icon: spell1Icon,

        description:
          "Deals {multiplier}x Physical Damage + {flat} bonus damage and has a {stunChance}% chance to Stun for {duration} turn(s).",
      },

      unlockLevel: 1,
      manaCost: 12,

      scaling: [
        // [damageMultiplier, flatDamagePerLevel, stunChance, stunDuration]
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

    {
      id: "s2",

      type: "tauntDefenseBuff",

      info: {
        name: "Iron Will",

        icon: spell2Icon,

        description:
          "Taunts all enemies and reduces damage taken by {damageReduction}% for {duration} turns.",
      },

      unlockLevel: 5,
      manaCost: 15,

      scaling: [
        // [damageReduction, duration]
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

    {
      id: "s3",

      type: "emergencyShield",

      info: {
        name: "Last Stand",

        icon: spell3Icon,

        description:
          "When HP drops below {hpThreshold}%, automatically gain a shield equal to {shieldPercent}% of Max HP. Triggers once per battle.",
      },

      unlockLevel: 15,
      manaCost: 25,

      scaling: [
        // [hpThreshold, shieldPercent]
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
  ],
}
