var display = require('display');
var keyboard = require('keyboard');

// --- API Hivatkozások ---
var width = display.width;
var height = display.height;
var fillScreen = display.fill;
var drawFillRect = display.drawFillRect;
var drawString = display.drawString;
var setTextSize = display.setTextSize;

// --- Kijelző Méretek ---
var screenWidth = width();
var screenHeight = height();

// --- Játék Beállítások ---
var PLAYER_WIDTH = 12;
var PLAYER_HEIGHT = 8;
var PLAYER_SPEED = 8;
var RELOAD_SPEED = 4;

// Színek
var COLOR_PLAYER = 0x00FF00;
var COLOR_BULLET = 0xFFFF00;
var COLOR_ENEMY = 0xFF0000;
var COLOR_ENEMY_BULLET = 0xFF6600;
var COLOR_BOSS = 0xFF00FF;
var COLOR_BG = 0x000000;
var COLOR_STAR = 0xAAAAAA;

// --- Változók ---
var playerX = screenWidth / 2;
var playerY = screenHeight - 20;
var playerLives = 3;
var playerScore = 0;
var playerReloadTimer = 0;

var bullets = [];
var enemies = [];
var enemyBullets = [];
var bosses = [];
var stars = [];

var level = 1;
var enemySpawnTimer = 0;
var bossSpawnTimer = 0;

var gameRunning = true;
var gameOver = false;
var gameState = "START"; 

// --- CSILLAGOK ---
function initStars() {
    stars = [];
    for (var i = 0; i < 15; i++) {
        stars.push({
            x: Math.floor(Math.random() * screenWidth),
            y: Math.floor(Math.random() * screenHeight),
            speed: 1 + Math.random() * 2
        });
    }
}

function updateAndDrawStars() {
    for (var i = 0; i < stars.length; i++) {
        drawFillRect(Math.floor(stars[i].x), Math.floor(stars[i].y), 1, 1, COLOR_BG);
        stars[i].y += stars[i].speed;
        if (stars[i].y > screenHeight) {
            stars[i].y = 0;
            stars[i].x = Math.random() * screenWidth;
        }
        drawFillRect(Math.floor(stars[i].x), Math.floor(stars[i].y), 1, 1, COLOR_STAR);
    }
}

// --- LÖVEDÉKEK ---
function createBullet(x, y, isPlayer) {
    if (isPlayer) {
        bullets.push({x: x, y: y, speed: 6, width: 2, height: 6});
    } else {
        enemyBullets.push({x: x, y: y, speed: 3, width: 2, height: 4});
    }
}

// --- ELLENSÉGEK ---
function createEnemy(type) {
    var enemy = {
        x: Math.random() * (screenWidth - 16),
        y: -10,
        width: 12, height: 8,
        speed: 1 + level * 0.2,
        health: 1, type: type, shootTimer: 0
    };
    if (type === 2) { 
        enemy.width = 16; enemy.height = 12;
        enemy.health = 3; enemy.speed = 0.5 + level * 0.1;
    } 
    enemies.push(enemy);
}

function createBoss() {
    var boss = {
        x: screenWidth / 2 - 20, y: -40,
        width: 40, height: 25, speed: 1,
        health: 20 + (level * 5), maxHealth: 20 + (level * 5),
        type: 1, shootTimer: 0, moveDir: 1
    };
    bosses.push(boss);
}

// --- LOGIKA ---

function updatePlayer(btnLeft, btnRight, btnFire) {
    // Balra (Prev)
    if (btnLeft && playerX > 0) {
        playerX -= PLAYER_SPEED;
    }
    
    // Jobbra (Next)
    if (btnRight && playerX < screenWidth - PLAYER_WIDTH) {
        playerX += PLAYER_SPEED;
    }

    // Tűz (Sel)
    if (playerReloadTimer > 0) playerReloadTimer--;
    
    if (btnFire && playerReloadTimer === 0) {
        createBullet(playerX + PLAYER_WIDTH / 2 - 1, playerY - 2, true);
        playerReloadTimer = RELOAD_SPEED; 
    }
}

function updateGameObjects() {
    // Lövedékek
    for (var i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= bullets[i].speed;
        if (bullets[i].y < -10) { bullets.splice(i, 1); continue; }
        
        for (var j = enemies.length - 1; j >= 0; j--) {
            var e = enemies[j];
            if (bullets[i] && e && 
                bullets[i].x < e.x + e.width && bullets[i].x + bullets[i].width > e.x &&
                bullets[i].y < e.y + e.height && bullets[i].y + bullets[i].height > e.y) {
                bullets.splice(i, 1);
                e.health--;
                if (e.health <= 0) { enemies.splice(j, 1); playerScore += 10; }
                break;
            }
        }
        if (bullets[i]) {
            for (var b = 0; b < bosses.length; b++) {
                var boss = bosses[b];
                if (bullets[i].x < boss.x + boss.width && bullets[i].x + bullets[i].width > boss.x &&
                    bullets[i].y < boss.y + boss.height && bullets[i].y + bullets[i].height > boss.y) {
                    bullets.splice(i, 1);
                    boss.health--;
                    if (boss.health <= 0) {
                        bosses.splice(b, 1); playerScore += 500; level++; playerLives++;
                    }
                    break;
                }
            }
        }
    }

    // Ellenségek
    enemySpawnTimer++;
    if (bosses.length === 0 && enemySpawnTimer > Math.max(20, 60 - level * 5)) {
        enemySpawnTimer = 0;
        createEnemy(Math.random() > 0.8 ? 2 : 1);
    }
    bossSpawnTimer++;
    if (bosses.length === 0 && playerScore > level * 500 && bossSpawnTimer > 200) {
        createBoss(); bossSpawnTimer = 0;
    }

    for (var i = enemies.length - 1; i >= 0; i--) {
        var e = enemies[i];
        e.y += e.speed;
        e.shootTimer++;
        if (e.shootTimer > 80 - level) {
            e.shootTimer = 0;
            if (Math.random() > 0.5) createBullet(e.x + e.width/2, e.y + e.height, false);
        }
        if (e.y > screenHeight) { enemies.splice(i, 1); continue; }
        if (e.x < playerX + PLAYER_WIDTH && e.x + e.width > playerX &&
            e.y < playerY + PLAYER_HEIGHT && e.y + e.height > playerY) {
            playerLives--; enemies.splice(i, 1);
            if (playerLives <= 0) gameState = "GAMEOVER";
        }
    }

    // Boss
    for (var i = 0; i < bosses.length; i++) {
        var boss = bosses[i];
        if (boss.y < 20) boss.y++;
        boss.x += boss.speed * boss.moveDir;
        if (boss.x <= 0 || boss.x >= screenWidth - boss.width) boss.moveDir *= -1;
        boss.shootTimer++;
        if (boss.shootTimer > 20) {
            createBullet(boss.x + boss.width/2, boss.y + boss.height, false);
            if (level > 2) {
                createBullet(boss.x, boss.y + boss.height, false);
                createBullet(boss.x + boss.width, boss.y + boss.height, false);
            }
            boss.shootTimer = 0;
        }
    }

    // Ellenség lövedék
    for (var i = enemyBullets.length - 1; i >= 0; i--) {
        var eb = enemyBullets[i];
        eb.y += eb.speed;
        if (eb.y > screenHeight) { enemyBullets.splice(i, 1); continue; }
        if (eb.x < playerX + PLAYER_WIDTH && eb.x + eb.width > playerX &&
            eb.y < playerY + PLAYER_HEIGHT && eb.y + eb.height > playerY) {
            enemyBullets.splice(i, 1); playerLives--;
            if (playerLives <= 0) gameState = "GAMEOVER";
        }
    }
}

// --- RAJZOLÁS ---
function drawGame() {
    fillScreen(COLOR_BG);
    updateAndDrawStars();

    drawFillRect(Math.floor(playerX), Math.floor(playerY), PLAYER_WIDTH, PLAYER_HEIGHT, COLOR_PLAYER);
    drawFillRect(Math.floor(playerX + PLAYER_WIDTH/2 - 2), Math.floor(playerY - 2), 4, 2, COLOR_PLAYER);

    for (var i = 0; i < bullets.length; i++) drawFillRect(Math.floor(bullets[i].x), Math.floor(bullets[i].y), bullets[i].width, bullets[i].height, COLOR_BULLET);
    for (var i = 0; i < enemyBullets.length; i++) drawFillRect(Math.floor(enemyBullets[i].x), Math.floor(enemyBullets[i].y), enemyBullets[i].width, enemyBullets[i].height, COLOR_ENEMY_BULLET);

    for (var i = 0; i < enemies.length; i++) {
        var e = enemies[i];
        drawFillRect(Math.floor(e.x), Math.floor(e.y), e.width, e.height, COLOR_ENEMY);
        drawFillRect(Math.floor(e.x + 2), Math.floor(e.y + 2), 2, 2, 0xFFFFFF);
        drawFillRect(Math.floor(e.x + e.width - 4), Math.floor(e.y + 2), 2, 2, 0xFFFFFF);
    }
    for (var i = 0; i < bosses.length; i++) {
        var b = bosses[i];
        drawFillRect(Math.floor(b.x), Math.floor(b.y), b.width, b.height, COLOR_BOSS);
        var hpBar = (b.health / b.maxHealth) * b.width;
        drawFillRect(Math.floor(b.x), Math.floor(b.y - 4), Math.floor(hpBar), 2, 0x00FF00);
    }

    setTextSize(1);
    drawString("Score: " + playerScore, 2, 2);
    drawString("HP: " + playerLives, screenWidth - 40, 2);
}

function drawMenu(title, sub) {
    fillScreen(0x000000);
    setTextSize(2); drawString(title, 20, 30);
    setTextSize(1); drawString(sub, 20, 60);
    drawString("[Prev] Left  [Next] Right", 5, screenHeight - 20);
    drawString("[M5] Fire    [Prev+Next] Exit", 5, screenHeight - 10);
}

function drawGameOver() {
    fillScreen(0x000000); 
    drawFillRect(20, 30, screenWidth - 40, 80, 0x330000); 
    setTextSize(2); drawString("GAME OVER", 35, 45);
    setTextSize(1); drawString("Score: " + playerScore, 50, 70);
    drawString("Press [M5] to Retry", 30, 90);
}

// --- FŐ CIKLUS ---

// FONTOS: Kikapcsoljuk a hosszú nyomást, hogy ne zavarjon
keyboard.setLongPress(false);

initStars();
drawMenu("SPACE", "SHOOTER");

while (true) {
    // Először eltároljuk a gombok állapotát
    var btnFire = keyboard.getSelPress();    // M5 Nagy gomb
    var btnLeft = keyboard.getPrevPress();   // Felső (Prev)
    var btnRight = keyboard.getNextPress();  // Alsó (Next)

    // KILÉPÉS: Ha mindkettőt egyszerre nyomod (Prev + Next)
    // Megjegyzés: Egyszerre kell lenyomni őket!
    if (btnLeft && btnRight) {
        break;
    }

    if (gameState === "START") {
        if (btnFire) {
            gameState = "PLAY";
            playerX = screenWidth / 2;
            playerLives = 3;
            playerScore = 0;
            level = 1;
            enemies = []; bullets = []; bosses = []; enemyBullets = [];
        }
    } 
    else if (gameState === "GAMEOVER") {
        if (btnFire) gameState = "START";
    }
    else if (gameState === "PLAY") {
        // Átadjuk a gombok állapotát a játékos frissítésnek
        updatePlayer(btnLeft, btnRight, btnFire);
        updateGameObjects();
        drawGame();
    }

    if (gameState === "START") drawMenu("SPACE", "SHOOTER");
    if (gameState === "GAMEOVER") drawGameOver();

    delay(30); 
}

fillScreen(0);
drawString("Bye!", 60, 60);