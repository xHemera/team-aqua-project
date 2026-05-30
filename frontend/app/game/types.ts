export type PlayerState = {
  id: number;
  characters: CharacterState[];
};

export type CharacterState = {
  uid: string;
  currentHp: number;
  currentMp: number;
  maxHp: number;
  maxMp: number;
  owner: number;
  stunned: number;
  invisible: number;
  shieldHp: number;
  overHp: number;
  invul: number;
  taunted: number;
  poison: { value: number; turn: number }[];
  lastStandUsable: boolean;
  lastStandUsed: boolean;
};

export type TurnQueueEntry = {
  characterUid: string;
  playerOwner: number;
  charge: number;
};

export type DamageEvent = {
  targetUid: string;
  attackerUid: string;
  damage: number;
  isCrit: boolean;
  lethal: boolean;
};

export type GameStatePayload = {
  turn: number;
  gamePhase: string;
  winnerId: number | null;
  activePlayerOwner: number;
  playerId: number;
  turnQueue: TurnQueueEntry[];
  players: PlayerState[];
  damageEvents: DamageEvent[];
};
