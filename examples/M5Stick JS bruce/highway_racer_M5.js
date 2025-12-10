var display = require('display');
var keyboard = require('keyboard');

// --- API Hivatkozások ---
var width = display.width;
var height = display.height;
var drawFillRect = display.drawFillRect;
var drawString = display.drawString;
var setTextSize = display.setTextSize;

// --- Kijelző Méretek ---
var screenWidth = width();
var screenHeight = height();

// --- Konfiguráció ---
var LANE_COUNT = 4;
var LANE_WIDTH = Math.floor(screenWidth / LANE_COUNT); 
var CAR_WIDTH = Math.floor(LANE_WIDTH * 0.5); 
var CAR_HEIGHT = Math.floor(LANE_WIDTH * 0.8);

// A JÁTÉKOS Y POZÍCIÓJA (FIX)
var PLAYER_Y = screenHeight - CAR_HEIGHT - 10;

// Színek
var COLOR_PLAYER = 0x0066FF;
var COLOR_ENEMY1 = 0xFF0000;
var COLOR_ENEMY2 = 0x00FF00;
var COLOR_ENEMY3 = 0xFFFF00;
var COLOR_ROAD = 0x202020; 
var COLOR_LINE = 0xFFFFFF;

// --- Játék Állapot ---
var playerLane = 1; 
var playerX = 0;
var playerTargetX = 0;
var playerScore = 0;
var gameSpeed = 4;

var cars = [];
var carSpawnTimer = 0;
var roadLines = [];

var gameState = "START"; // START, PLAY, GAMEOVER
var menuSelection = 0;

// --- Inicializálás ---
function initGame() {
    playerLane = 1;
    updatePlayerPosTarget();
    playerX = playerTargetX; 
    playerScore = 0;
    cars = [];
    carSpawnTimer = 0;
    gameSpeed = 4;
    gameState = "PLAY";
    
    roadLines = [];
    var numLines = Math.floor(screenHeight / 30) + 2;
    for (var i = 0; i < numLines; i++) {
        roadLines.push({ y: i * 30 });
    }
}

function updatePlayerPosTarget() {
    playerTargetX = (playerLane * LANE_WIDTH) + (LANE_WIDTH / 2);
}

// --- Logika ---

function updatePhysics() {
    // Játékos mozgás
    if (playerX !== playerTargetX) {
        var diff = playerTargetX - playerX;
        var step = Math.ceil(Math.abs(diff) / 3); 
        if (Math.abs(diff) <= step) {
            playerX = playerTargetX;
        } else {
            playerX += diff > 0 ? step : -step;
        }
    }

    // Út mozgatása
    for (var i = 0; i < roadLines.length; i++) {
        roadLines[i].y += gameSpeed;
        if (roadLines[i].y > screenHeight) {
            roadLines[i].y = -30;
        }
    }

    // Ellenségek spawnolása
    carSpawnTimer++;
    var spawnThreshold = Math.max(15, 50 - (gameSpeed * 2));
    
    if (carSpawnTimer > spawnThreshold) {
        if (Math.random() > 0.3) {
            spawnCar();
            carSpawnTimer = 0;
        }
    }

    // Autók mozgatása és ütközés
    for (var i = cars.length - 1; i >= 0; i--) {
        var car = cars[i];
        car.y += (car.speed + gameSpeed * 0.8);

        // Törlés ha kiment a képernyőről
        if (car.y > screenHeight) {
            cars.splice(i, 1);
            playerScore++;
            // Sebesség növelés
            if (playerScore % 5 === 0 && gameSpeed < 12) {
                gameSpeed += 0.5;
            }
            continue;
        }

        // Ütközésvizsgálat
        var dx = Math.abs(playerX - car.x);
        
        // ITT VOLT A HIBA: playerY helyett PLAYER_Y kell!
        var dy = Math.abs(PLAYER_Y - car.y);
        
        // Ha ütközés van
        if (dx < (CAR_WIDTH * 0.8) && dy < (CAR_HEIGHT * 0.8)) {
            gameState = "GAMEOVER";
        }
    }
}

function spawnCar() {
    var lane = Math.floor(Math.random() * LANE_COUNT);
    
    for (var i = 0; i < cars.length; i++) {
        if (cars[i].lane === lane && cars[i].y < 60) return;
    }

    var type = Math.floor(Math.random() * 3);
    var cColor = type === 0 ? COLOR_ENEMY1 : type === 1 ? COLOR_ENEMY2 : COLOR_ENEMY3;

    cars.push({
        x: (lane * LANE_WIDTH) + (LANE_WIDTH / 2),
        y: -40,
        lane: lane,
        speed: 2 + Math.random() * 2,
        color: cColor
    });
}

// --- Rajzolás ---

function drawCar(x, y, color, isPlayer) {
    var w = CAR_WIDTH;
    var h = CAR_HEIGHT;
    var left = Math.floor(x - w / 2);
    var top = Math.floor(y - h / 2);

    drawFillRect(left, top, w, h, color);
    drawFillRect(left + 2, top + (h/4), w - 4, h/2, 0x000000);
    
    var lightColor = isPlayer ? 0xFF0000 : 0xFFFF00;
    var lightY = isPlayer ? top + h - 2 : top;
    
    drawFillRect(left + 1, lightY, 3, 2, lightColor);
    drawFillRect(left + w - 4, lightY, 3, 2, lightColor);
}

function drawGame() {
    drawFillRect(0, 0, screenWidth, screenHeight, COLOR_ROAD);

    for (var i = 1; i < LANE_COUNT; i++) {
        var lx = i * LANE_WIDTH;
        for (var j = 0; j < roadLines.length; j++) {
            drawFillRect(lx - 1, roadLines[j].y, 2, 15, COLOR_LINE);
        }
    }

    for (var i = 0; i < cars.length; i++) {
        drawCar(cars[i].x, cars[i].y, cars[i].color, false);
    }

    // Játékos kirajzolása (PLAYER_Y változóval)
    drawCar(playerX, PLAYER_Y, COLOR_PLAYER, true);

    setTextSize(1);
    drawString("Score: " + playerScore, 2, 2);
}

function drawMenu(title, subtitle) {
    drawFillRect(0, 0, screenWidth, screenHeight, 0x000000);
    setTextSize(2);
    drawString(title, (screenWidth/2) - (title.length*6), 30);
    setTextSize(1);
    drawString(subtitle, (screenWidth/2) - (subtitle.length*3), 60);
    drawString("[A] Start   [B] Lane", 10, screenHeight - 20);
}

function drawGameOver() {
    var boxW = screenWidth - 40;
    var boxH = 80;
    var boxX = 20;
    var boxY = (screenHeight / 2) - 40;
    
    drawFillRect(boxX, boxY, boxW, boxH, 0x330000); 
    drawFillRect(boxX+2, boxY+2, boxW-4, boxH-4, 0xFF0000); 
    
    setTextSize(2);
    drawString("CRASH!", boxX + 25, boxY + 20);
    setTextSize(1);
    drawString("Score: " + playerScore, boxX + 35, boxY + 45);
    drawString("Press [A] to Retry", boxX + 15, boxY + 65);
}

// --- Fő Loop ---

drawMenu("RACER", "M5Stick Edition");

while (true) {
    var btnA = keyboard.getSelPress(); // Nagy gomb
    var btnB = keyboard.getNextPress(); // Oldalsó gomb
    var btnEsc = keyboard.getEscPress(); // CardKB ESC

    if (btnEsc) break;

    if (gameState === "START") {
        if (btnA) initGame();
    }
    
    else if (gameState === "GAMEOVER") {
        if (btnA) initGame();
    }

    else if (gameState === "PLAY") {
        // BALRA: A gomb vagy Prev
        if ((btnA || keyboard.getPrevPress()) && playerLane > 0) {
            playerLane--;
            updatePlayerPosTarget();
        }
        
        // JOBBRA: B gomb vagy Next
        if ((btnB || keyboard.getNextPress()) && playerLane < LANE_COUNT - 1) {
            playerLane++;
            updatePlayerPosTarget();
        }

        updatePhysics();
        drawGame();
    }
    
    delay(33);
}

display.fill(0);
drawString("Bye!", 60, 60);