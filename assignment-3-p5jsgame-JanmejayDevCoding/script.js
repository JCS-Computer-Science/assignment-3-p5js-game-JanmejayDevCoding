let enemies = [];
let bullets = [];
let powerups = [];
let score = 0;
let hp = 100;
let displayHp = 100; // Used for the smooth animation
let gameState = "PLAY";

// Powerup States
let autoFire = false;
let autoFireTimer = 0;
let shieldActive = false;
let shieldTimer = 0;

function setup() {
    createCanvas(windowWidth, windowHeight);
    rectMode(CENTER);
}

function draw() {
    background(10, 10, 25);

    if (gameState === "PLAY") {
        playGame();
    } else {
        showGameOver();
    }
}

function playGame() {
    let horizon = height * 0.6;
    let playerY = max(mouseY, horizon);

    // 1. SMOOTH HP LOGIC
    if (hp <= 0) {
        hp = 0;
        gameState = "GAMEOVER";
    }
    hp = constrain(hp, 0, 100);
    // lerp(current, target, speed) - 0.1 makes it move 10% of the way each frame
    displayHp = lerp(displayHp, hp, 0.1);

    // 2. POWERUP TIMERS
    if (autoFire) {
        if (frameCount % 6 == 0) bullets.push(new Bullet(mouseX, playerY));
        autoFireTimer--;
        if (autoFireTimer <= 0) autoFire = false;
    }

    if (shieldActive) {
        shieldTimer--;
        if (shieldTimer <= 0) shieldActive = false;
    }

    // 3. SPAWNING
    if (frameCount % 40 == 0) enemies.push(new Enemy());

    if (frameCount % 300 == 0) {
        let r = random(1);
        let type = "MACHINE_GUN";
        if (r > 0.66) type = "HEAL";
        else if (r > 0.33) type = "SHIELD";
        powerups.push(new PowerUp(random(width), -20, type));
    }

    // 4. MANAGE POWERUPS (Now shootable!)
    for (let i = powerups.length - 1; i >= 0; i--) {
        powerups[i].move();
        powerups[i].show();

        // Pick up by touching
        if (dist(mouseX, playerY, powerups[i].x, powerups[i].y) < 35) {
            applyPowerUp(powerups[i].type);
            powerups.splice(i, 1);
            continue;
        }

        // Pick up by shooting
        for (let j = bullets.length - 1; j >= 0; j--) {
            if (dist(bullets[j].x, bullets[j].y, powerups[i].x, powerups[i].y) < 20) {
                applyPowerUp(powerups[i].type);
                powerups.splice(i, 1);
                bullets.splice(j, 1);
                break;
            }
        }
    }

    // 5. MANAGE ENEMIES
    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].move();
        enemies[i].show();

        if (enemies[i].y > height) {
            if (!shieldActive) hp -= 10; // Shield protects HP
            enemies.splice(i, 1);
            continue;
        }

        for (let j = bullets.length - 1; j >= 0; j--) {
            if (enemies[i].hits(bullets[j])) {
                enemies.splice(i, 1);
                bullets.splice(j, 1);
                score += 10;
                hp += 2;
                break;
            }
        }
    }

    // 6. MANAGE BULLETS
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].move();
        bullets[i].show();
        if (bullets[i].isOffScreen()) bullets.splice(i, 1);
    }

    // DRAW PLAYER
    if (shieldActive) {
        noFill();
        stroke(0, 200, 255, 150);
        strokeWeight(3);
        circle(mouseX, playerY, 60);
        noStroke();
    }

    fill(autoFire ? color(255, 200, 0) : 255);
    triangle(mouseX, playerY - 20, mouseX - 15, playerY + 10, mouseX + 15, playerY + 10);

    drawUI();
}

function applyPowerUp(type) {
    if (type === "MACHINE_GUN") {
        autoFire = true;
        autoFireTimer = 300;
    } else if (type === "HEAL") {
        hp = 100;
    } else if (type === "SHIELD") {
        shieldActive = true;
        shieldTimer = 480; // 8 seconds
    }
}

function drawUI() {
    // Score
    fill(255);
    textAlign(LEFT);
    textSize(24);
    text("Score: " + score, 20, 40);

    // HP Bar background
    fill(50);
    noStroke();
    rectMode(CORNER);
    rect(20, 60, 200, 20);

    // Smooth HP Bar foreground
    let barColor = color(0, 255, 100);
    if (hp < 30) barColor = color(255, 50, 50);
    fill(barColor);
    rect(20, 60, displayHp * 2, 20);

    rectMode(CENTER);
}

function showGameOver() {
    textAlign(CENTER);
    fill(255, 50, 50);
    textSize(64);
    text("GAME OVER", width / 2, height / 2);
    fill(255);
    textSize(24);
    text("Final Score: " + score, width / 2, height / 2 + 50);
    text("Click to Restart", width / 2, height / 2 + 100);
}

function mousePressed() {
    if (gameState === "PLAY") {
        let horizon = height * 0.6;
        let playerY = max(mouseY, horizon);
        bullets.push(new Bullet(mouseX, playerY));
    } else {
        hp = 100;
        displayHp = 100;
        score = 0;
        enemies = [];
        bullets = [];
        powerups = [];
        autoFire = false;
        shieldActive = false;
        gameState = "PLAY";
    }
}

// --- CLASSES ---

class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.r = 8;
    }
    move() { this.y -= 10; }
    show() {
        fill(0, 255, 255);
        circle(this.x, this.y, this.r);
    }
    isOffScreen() { return this.y < 0; }
}

class Enemy {
    constructor() {
        this.x = random(width);
        this.y = -20;
        this.speed = random(2, 5);
        this.size = 30;
    }
    move() { this.y += this.speed; }
    show() {
        fill(255, 50, 100);
        rect(this.x, this.y, this.size, this.size);
    }
    hits(bullet) {
        let d = dist(this.x, this.y, bullet.x, bullet.y);
        return (d < this.size / 2 + bullet.r / 2);
    }
}

class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.speed = 2.5;
    }
    move() { this.y += this.speed; }
    show() {
        if (this.type === "MACHINE_GUN") {
            fill(255, 200, 0);
            circle(this.x, this.y, 25);
        } else if (this.type === "HEAL") {
            fill(0, 255, 100);
            rect(this.x, this.y, 20, 6);
            rect(this.x, this.y, 6, 20);
        } else if (this.type === "SHIELD") {
            fill(0, 150, 255);
            stroke(255);
            circle(this.x, this.y, 25);
            noStroke();
        }
    }
}