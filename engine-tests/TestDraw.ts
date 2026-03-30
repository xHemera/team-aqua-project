import { Game } from "../engine/Game"
import { GameState } from "../engine/GameState"
import { PlayerState } from "../engine/player/PlayerState"

import { PokemonCard } from "../engine/cards/PokemonCard"
import { CardInstance } from "../engine/instances/CardInstance"

import { GameAction } from "../engine/actions/GameAction"

console.log("TEST DRAW CARD")

// carte
const pikachu = new PokemonCard(
  "pikachu_001",
  "Pikachu",
  60,
  0,
  " "
)

// instances
const card1 = new CardInstance("uid1", pikachu, 0)
const card2 = new CardInstance("uid2", pikachu, 0)

// joueur
const player1 = new PlayerState()
player1.deck.push(card1)
player1.deck.push(card2)

const player2 = new PlayerState()

// état
const state: GameState = {
  players: [player1, player2],
  activePlayer: 0,
  turn: 1
}

const game = new Game(state)

console.log("Deck before:", game.state.players[0].deck.length)
console.log("Hand before:", game.state.players[0].hand.length)

// action
const action: GameAction = {
  type: "DRAW_CARD",
  player: 0
}

game.dispatch(action)

console.log("Deck after:", game.state.players[0].deck.length)
console.log("Hand after:", game.state.players[0].hand.length)

game.dispatch(action)

console.log("Deck after:", game.state.players[0].deck.length)
console.log("Hand after:", game.state.players[0].hand.length)

game.dispatch(action)