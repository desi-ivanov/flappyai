const CANVAS = {
    width: 800,
    height: 600,
    current: null
}
function setup() {
    CANVAS.current = createCanvas(CANVAS.width, CANVAS.height);
}

// function NeuralNetwork(inNumber, midNumber, outNumber) {
//     const inputNodes = Array.from({ length: inNumber });
//     const midNodes = Array.from({ length: midNumber });
//     const outNodes = Array.from({ length: outNumber });

//     const lWeights = Array.from({ length: inNumber * midNumber });
//     const rWeights = Array.from({ length: midNumber * outNumber})

//     return (data) => {
//         const net = [
//             []
//         ]

//     }
// }

const G = 2000
const startX = 100;
function sigmoid(x) {
    return 1 / (1 + Math.E ** (-x));
}
let learningRate = 0;
class Player {
    constructor(dna = {
        perceptron: (Math.random() * 2 - 1),
        weights: Array.from({ length: 4 }).map(() => Math.random() * 2 - 1)
    }) {
        this.radius = 25
        this.position = { x: startX, y: CANVAS.height / 2 }
        this.velocity = { x: 0, y: 0 }
        this.dna = {
            perceptron: dna.perceptron + (Math.random() * 2 - 1) * learningRate,
            weights: dna.weights.map((v) => v + (Math.random() * 2 - 1) * learningRate)
        }

    }
    update(s) {
        this.position.x += this.velocity.x * s;
        this.position.y += this.velocity.y * s;
        this.velocity.y += G * s
    }
    jump() {
        this.velocity.y = -500
    }
    considerJump(nearestTube) {
        const layer = [this.position.y, nearestTube.position.x, nearestTube.position.y, nearestTube.botY]
        let res = sigmoid(layer.reduce((a, v, i) => sigmoid(v * this.dna.weights[i]) - 0.5 + a, 0) * this.dna.perceptron);
        if(res >= 0.5) {
            this.jump();
        }
    }
    draw() {
        circle(this.position.x, this.position.y, this.radius);
    }
}

class Tube {
    spot = 150;
    width = 50;
    constructor(x) {
        this.position = { x: x, y: Math.random() * CANVAS.height / 2 }
        this.velocity = { x: -300, y: 0 }
        this.botY = this.position.y + this.spot;
    }
    update(s) {
        this.position.x += this.velocity.x * s;
    }
    draw() {
        rect(this.position.x, 0, this.width, this.position.y);
        rect(this.position.x, this.botY, this.width, CANVAS.height);
    }
}

let tubes = [new Tube(300), new Tube(600), new Tube(900)];
let players = Array.from({ length: 1000 }).map(() => new Player());
let prev = Date.now();
let cnt = 0;
let nearestTube = tubes[0];
let score = 0;
let refreshRate = 0;
function draw() {
    if(cnt++ >= refreshRate) {
        background(55, 55, 55);
        players.forEach(p => p.draw());
        tubes.forEach(t => t.draw());
        cnt = 0;
    }
    const deltaS = (Date.now() - prev) / 1000;
    players.forEach(p => p.update(deltaS));
    tubes.forEach(t => t.update(deltaS));
    if(tubes[0].position.x + tubes[0].width <= 0) {
        tubes.shift()
        tubes.push(new Tube(CANVAS.width));
    }
    players.forEach(p => p.considerJump(nearestTube));
    prev = Date.now();

    if(nearestTube.position.x + nearestTube.width < startX) {
        nearestTube = tubes[1];
        score++;
    }
    let latest = players[0];
    for(let i = 0; i < players.length; i++) {
        if(hasHit(players[i])) {
            players.splice(i, 1);
            i--;
        }
    }
    if(players.length === 0) {
        learningRate = 1 / (1 + score * 2)
        players = Array.from({ length: 1000 }).map(() => new Player(latest.dna)).concat(latest);
        tubes = [new Tube(300), new Tube(600), new Tube(900)];
        nearestTube = tubes[0];
        console.log("Score", score)
        score = 0;
    }
}
function hasHit(player) {
    if(player.position.x + player.radius / 2 > nearestTube.position.x && player.position.x - player.radius / 2 < nearestTube.position.x + nearestTube.width) {
        if(player.position.y - player.radius / 2 < nearestTube.position.y || player.position.y > nearestTube.botY) {
            return true;
        }
    }
    return false;
}
// function keyPressed() {
//     if(keyCode === 32) {
//         player.jump();
//     }
// }