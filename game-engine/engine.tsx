class Game {
    
}

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

class Card {
    name:       string;
    text:       string; 
    img:        string;
    type:       string;

    constructor() {
        this.name = "DefaultName";
        this.text = "DefaultDesc";
        this.type = "DefaultType";
        this.img = "Link";
    }
}