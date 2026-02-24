class Player {
    deck:       Card[];
    dispile:    Card[];
    bench:      Card[];
    hand:       Card[];
    active:     Card;

    constructor() {
        this.active = new Card();
        this.deck = [];
        this.dispile = [];
        this.bench = [];
        this.hand = [];
    }
}