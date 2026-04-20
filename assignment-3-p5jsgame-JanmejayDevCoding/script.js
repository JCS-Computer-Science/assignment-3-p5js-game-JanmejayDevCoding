let enemies = [];
let bullets = [];
let score = 0;

function setup() {
    createCanvas(windowWidth, windowHeight);
}

function draw() {
    background(10, 10, 25);

    // 1. MANAGE BULLETS
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= 10;
        fill(0, 255, 255);
        noStroke();
        circle(bullets[i].x, bullets[i].y, 8);

        if (bullets[i].y < 0) {
            bullets.splice(i, 1);
        }
    }

    if (frameCount % 40 == 0) {
        enemies.push({
            x: random(width),
            y: -20,
            speed: random(2, 5)
        });
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].y += enemies[i].speed;


        fill(255, 50, 100);
        rect(enemies[i].x, enemies[i].y, 30, 30);

        for (let j = bullets.length - 1; j >= 0; j--) {
            if (dist(bullets[j].x, bullets[j].y, enemies[i].x, enemies[i].y) < 25) {
                enemies.splice(i, 1);
                bullets.splice(j, 1);
                score += 10;
                break;
            }
        }
    }
    fill(255);
    triangle(mouseX, mouseY - 20, mouseX - 15, mouseY + 10, mouseX + 15, mouseY + 10);

    // UI
    fill(255);
    textSize(24);
    text("Score: " + score, 20, 40);
}

function mousePressed() {
    bullets.push({ x: mouseX, y: mouseY });
}