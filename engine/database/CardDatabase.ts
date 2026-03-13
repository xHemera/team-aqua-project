import { Card } from "../cards/Card"

export class CardDatabase {
	private cards: Map<string, Card> = new Map()

	registerCard(card: Card) {
		this.cards.set(card.id, card)
	}

	getCard(id: string): Card {
		const card = this.cards.get(id)

		if(!card)
			throw new Error("Card not found: " + id)

		return card
	}
}