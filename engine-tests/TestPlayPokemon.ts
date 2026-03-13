import { Game } from "../engine/Game"
import { GameState } from "../engine/GameState"
import { PlayerState } from "../engine/player/PlayerState"
import { PokemonCard } from "../engine/cards/PokemonCard"
import { CardInstance } from "../engine/instances/CardInstance"
import { GameAction } from "../engine/actions/GameAction"

console.log("TEST PLAY POKEMON")

const pikachu = new PokemonCard(
  "pikachu_001",
  "Pikachu",
  60,
  0
)

const card = new CardInstance("uid1", pikachu, 0)

const player1 = new PlayerState()
player1.hand.push(card)

const player2 = new PlayerState()

const state: GameState = {
  players: [player1, player2],
  activePlayer: 0,
  turn: 1
}

const game = new Game(state)

console.log("Hand before:", game.state.players[0].hand.length)
console.log("Bench before:", game.state.players[0].bench.length)

const action: GameAction = {
  type: "PLAY_POKEMON",
  player: 0,
  cardUid: "uid1"
}

game.dispatch(action)

console.log("Hand after:", game.state.players[0].hand.length)
console.log("Bench after:", game.state.players[0].bench.length)