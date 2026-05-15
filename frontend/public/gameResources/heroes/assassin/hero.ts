const ID = "assassin";

const PATH = `/gameResources/heroes/${ID}/assets`;

const portrait = `${PATH}/avatar/Charon_Garment1_Icon_Small.webp`;
const body = `${PATH}/body/Charon_Garment1.webp`;
const spell1Icon = `${PATH}/spells/silenced.png`;
const spell2Icon = `${PATH}/spells/poison_dagger.png`;
const spell3Icon = `${PATH}/spells/frenzy_spell.png`;

export const assassin = {
    identity: {
      id: ID,
      name: "Assassin",

      assets: {
        portrait: portrait,
        body: body,
      },
    },

  baseStats: {
    physicalDamage: 195,
    magicalDamage: 35,

    critChance: 18,
    critDamage: 200,

    hp: 1080,
    mp: 150,

    physicalResistance: 10,
    magicalResistance: 6,

    speed: 128,
  },

  growth: {
    physicalDamage: 10,
    magicalDamage: 3,

    critChance: 2,
    critDamage: 4,

    hp: 8,
    mp: 4,

    physicalResistance: 2,
    magicalResistance: 1,

    speed: 2,
  },

  skills: [
    {
      id: "s1",
      type: "executeDamage",
      info: {
        name: "Shadow Strike",
        icon: spell1Icon,
        description:
          "Deals {multiplier}x Physical Damage + {flat} bonus damage. Damage increased by {executeBonus}% if target HP is below {hpThreshold}%.",
      },
      unlockLevel: 1,
      manaCost: 10,
      scaling: [
        // [multiplier, flatDamagePerLevel, executeBonus, hpThreshold]
          [1.5, 20, 30, 50],
          [1.6, 24, 32, 50],
          [1.7, 28, 34, 50],
          [1.8, 32, 36, 50],
          [1.9, 36, 38, 50],
          [2.0, 40, 40, 50],
          [2.1, 44, 42, 50],
          [2.2, 48, 45, 50],
          [2.4, 54, 50, 55],
          [2.6, 60, 60, 60],
        ],
    },

    {
      id: "s2",
      type: "poisonDamage",
      info: {
        name: "Venom Blade",
        icon: spell2Icon,
        description:
          "Deals {multiplier}x Physical Damage + {flat} bonus damage and applies Poison for {duration} turns dealing {poison} damage per turn.",
      },
      unlockLevel: 6,
      manaCost: 14,
      scaling: [
        // [multiplier, flatDamagePerLevel, poisonDamagePerLevel, duration]
          [0.9, 12, 8, 3],
          [1.0, 14, 10, 3],
          [1.1, 16, 12, 3],
          [1.2, 18, 14, 3],
          [1.3, 20, 16, 3],
          [1.4, 22, 18, 4],
          [1.5, 24, 20, 4],
          [1.6, 28, 24, 4],
          [1.8, 32, 28, 5],
          [2.0, 38, 35, 5],
        ],
    },

    {
      id: "s3",
      type: "stealthBuff",
      info: {
        name: "Phantom Step",
        icon: spell3Icon,
        description:
          "Grants Invisibility for {duration} turn(s). The next attack deals {bonusDamage}% more damage.",
      },
      unlockLevel: 12,
      manaCost: 18,
      scaling: [
        // [duration, nextAttackBonus]
          [1, 15],
          [1, 20],
          [1, 25],
          [2, 30],
          [2, 35],
          [2, 40],
          [3, 45],
          [3, 55],
          [3, 70],
          [4, 90],
        ],
    },
  ],
}
