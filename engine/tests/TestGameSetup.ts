import { Game } from "../Game"
import { GameState } from "../GameState"
import { PlayerState } from "../player/PlayerState"

import { PokemonCard } from "../card/PokemonCard"
import { CardInstance } from "../instances/CardInstance"

console.log("TEST GAME SETUP")

// cartes
const pikachu = new PokemonCard(
  "pikachu_001",
  "Pikachu",
  60,
  0
)

// instances
const pikachu1 = new CardInstance("uid1", pikachu, 0)
const pikachu2 = new CardInstance("uid2", pikachu, 0)

// joueurs
const player1 = new PlayerState()
player1.deck.push(pikachu1)
player1.deck.push(pikachu2)

const player2 = new PlayerState()

// état du jeu
const state: GameState = {
  players: [player1, player2],
  activePlayer: 0,
  turn: 1
}

// jeu
const game = new Game(state)

console.log("Players:", game.state.players.length)
console.log("Player1 deck:", game.state.players[0].deck.length)
console.log("Turn:", game.state.turn)
console.log("Active player:", game.state.activePlayer)