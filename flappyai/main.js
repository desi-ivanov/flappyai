const canvasWidth = 800,
    canvasHeight = 600,
    gravity = 2000,
    jumpSpeed = -500,
    startX = 100,
    xSpeed = -400,
    spotHeight = 150,
    tubeWidth = 50,
    ballRadius = 15,
    ballsPerEpoch = 1000, //prompt("Balls per epoch? (eg. 1000)"),
    canvas = document.createElement("canvas");
canvas.setAttribute("width", canvasWidth);
canvas.setAttribute("height", canvasHeight);
document.body.appendChild(canvas);
const ctx = canvas.getContext("2d");
const randomVal = () => (Math.random() * 2) - 1;
const randomArr = l => Array.from({ length: l }).map(randomVal);
const activationFunction = x => 2 / (1 + Math.E ** (-2 * x)) - 1;
class Ball {
    constructor(bias = randomVal(), weights = randomArr(4), evolutionRate = 1) {
        this.y = canvasHeight / 2;
        this.ySpeed = 0;
        this.dna = {
            bias: (bias + randomVal() * evolutionRate) / 2,
            weights: weights.map(v => (v + randomVal() * evolutionRate) / 2)
        }
    }
    update(deltaS) {
        this.ySpeed += gravity * deltaS;
        this.y += this.ySpeed * deltaS;
    }
    jump = () => this.ySpeed = jumpSpeed;
    think(tube) {
        const output = activationFunction([this.y, this.ySpeed, tube.x, tube.botY]
            .map((v, i) => activationFunction(v * this.dna.weights[i]))
            .reduce((a, v) => a + v * this.dna.bias, 0));
        if(output >= 0) this.jump();
    }
    draw() {
        ctx.beginPath();
        ctx.arc(startX, this.y, ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = "#fff"
        ctx.fill();
        ctx.fillStyle = "#000"
        ctx.stroke();
        ctx.closePath();
    }
}
class Tube {
    constructor(x) {
        this.x = x;
        this.topY = Math.random() * canvasHeight / 2;
        this.botY = this.topY + spotHeight;
    }
    update = deltaS => this.x += xSpeed * deltaS;
    draw() {
        ctx.rect(this.x, 0, tubeWidth, this.topY);
        ctx.rect(this.x, this.botY, tubeWidth, canvasHeight);
        ctx.fillStyle = "#fff"
        ctx.fill();
        ctx.fillStyle = "#000"
        ctx.stroke();
    }
}

let tubes = [new Tube(startX + 300), new Tube(startX + 600), new Tube(startX + 900)];
let balls = randomArr(ballsPerEpoch).map(() => new Ball());
let nearestTube = tubes[0];
let prevUpdateTimestamp = Date.now();
let score = 0;
let epoch = 0;
balls.forEach(p => p.draw());
tubes.forEach(t => t.draw());
function update() {
    ctx.fillStyle = "#777"
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    tubes.forEach(t => t.draw());
    balls.forEach(p => p.draw());
    const deltaS = (Date.now() - prevUpdateTimestamp) / 1000;
    prevUpdateTimestamp = Date.now();
    if(nearestTube.x + tubeWidth < startX) {
        nearestTube = tubes[1];
        document.getElementById("info").innerHTML = "Epoch:" + epoch + "; Score: " + score
        score++;
    }
    balls.forEach(p => p.think(nearestTube));
    balls.forEach(p => p.update(deltaS));
    let lastAlive = balls[0];
    for(let i = 0; i < balls.length; i++) {
        if(gameOver(balls[i])) {
            balls.splice(i, 1);
            i--;
        }
    }
    if(balls.length === 0) {
        const evolutionRate = 1 / (1 + score * 0.5);
        balls = randomArr(ballsPerEpoch - 1)
            .map(() => new Ball(lastAlive.dna.bias, lastAlive.dna.weights, evolutionRate))
            .concat(lastAlive);
        tubes = [new Tube(startX + 300), new Tube(startX + 600), new Tube(startX + 900)];
        nearestTube = tubes[0];
        score = 0;
        epoch++;
        document.getElementById("info").innerHTML = "Epoch:" + epoch + "; Score: " + score
    }
    tubes.forEach(t => t.update(deltaS));
    if(tubes[0].x + tubeWidth <= 0) {
        tubes.shift()
        tubes.push(new Tube(startX + canvasWidth));
    }
    requestAnimationFrame(update);
}
function gameOver(ball) {
    return startX + ballRadius / 2 > nearestTube.x
        && startX - ballRadius / 2 < nearestTube.x + tubeWidth
        && (ball.y - ballRadius / 2 < nearestTube.topY || ball.y > nearestTube.botY)
}
update();