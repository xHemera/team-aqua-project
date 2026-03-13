import { Card } from "../cards/Card"

export class CardInstance {
	uid: string
	card: Card
	owner: number

	constructor(uid: string, card: Card, owner: number) {
		this.uid = uid
		this.card = card
		this.owner = owner
	}
}