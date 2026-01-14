// script.js

// Music controls
let bgMusic;
let musicPlaying = false;
const toggleBtn = document.getElementById('toggleMusic');
const volumeSlider = document.getElementById('volumeControl');

// Try to load music with loop enabled
bgMusic = new Audio('music/music.mp3');
bgMusic.loop = true; // Enable music looping
bgMusic.volume = 0.5;

// Ensure loop is maintained even after playback
bgMusic.addEventListener('ended', function() {
    this.currentTime = 0;
    this.play();
}, false);

bgMusic.addEventListener('error', function(e) {
    console.log('Music file not found. Please add music.mp3 to the music folder.');
    toggleBtn.textContent = 'NO MUSIC';
    toggleBtn.disabled = true;
});

toggleBtn.addEventListener('click', function() {
    if (musicPlaying) {
        bgMusic.pause();
        toggleBtn.textContent = 'PLAY';
        toggleBtn.classList.add('paused');
        musicPlaying = false;
    } else {
        bgMusic.play().catch(e => {
            console.log('Could not play music:', e);
        });
        toggleBtn.textContent = 'PAUSE';
        toggleBtn.classList.remove('paused');
        musicPlaying = true;
    }
});

volumeSlider.addEventListener('input', function() {
    bgMusic.volume = this.value / 100;
});
// Game variables
var gridSpace = 30;
var fallingPiece;
var gridPieces = [];
var lineFades = [];
var gridWorkers = [];

var currentScore = 0;
var currentLevel = 1;
var linesCleared = 0;

var ticks = 0;
var updateEvery = 15;
var updateEveryCurrent = 15;
var fallSpeed = gridSpace * 0.5;
var pauseGame = false;
var gameOver = false;

var gameEdgeLeft, gameEdgeRight;
var canvasWidth, canvasHeight;

var colors = [
    '#ecb5ff',
    '#ffa0ab',
    '#8cffb4',
    '#ff8666',
    '#80c3f5',
    '#c2e77d',
    '#fdf9a1',
];

function setup() {
    // Dynamic canvas sizing
    canvasWidth = min(windowWidth * 0.9, 600);
    canvasHeight = min(windowHeight * 0.9, 540);
    
    // Calculate game edges based on canvas width
    gameEdgeLeft = canvasWidth * 0.25;
    gameEdgeRight = canvasWidth * 0.75;
    
    let canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('gameContainer');
    
    fallingPiece = new playPiece();
    fallingPiece.resetPiece();
    textFont('Press Start 2P');
}

function windowResized() {
    canvasWidth = min(windowWidth * 0.9, 600);
    canvasHeight = min(windowHeight * 0.9, 540);
    gameEdgeLeft = canvasWidth * 0.25;
    gameEdgeRight = canvasWidth * 0.75;
    resizeCanvas(canvasWidth, canvasHeight);
}

function draw() {
    // Dark grey background
    background('#2a2a2a');
    
    // Game play area (middle)
    fill('#1a1a1a');
    noStroke();
    rect(gameEdgeLeft, 0, gameEdgeRight - gameEdgeLeft, height);
    
    // Side panels
    fill('#1f1f1f');
    rect(0, 0, gameEdgeLeft, height);
    rect(gameEdgeRight, 0, canvasWidth - gameEdgeRight, height);
    
    // Right panel setup
    let rightPanelX = gameEdgeRight + 10;
    let panelWidth = canvasWidth - gameEdgeRight - 20;
    
    // Draw info boxes with borders
    strokeWeight(3);
    
    // Score box
    fill('#0f0f0f');
    stroke('#00ff00');
    rect(rightPanelX, 40, panelWidth, 90, 5);
    
    // Level box
    fill('#0f0f0f');
    stroke('#00ccff');
    rect(rightPanelX, 145, panelWidth, 70, 5);
    
    // Lines box
    fill('#0f0f0f');
    stroke('#ffcc00');
    rect(rightPanelX, 230, panelWidth, 70, 5);
    
    // Next piece box
    fill('#0f0f0f');
    stroke('#ff00ff');
    rect(rightPanelX, 315, panelWidth, panelWidth, 5);
    
    // Draw labels with Press Start 2P font
    noStroke();
    textFont('Press Start 2P');
    textAlign(CENTER);
    
    let centerX = rightPanelX + panelWidth / 2;
    
    // Score label and value
    fill('#00ff00');
    textSize(canvasWidth > 400 ? 12 : 10);
    text("SCORE", centerX, 60);
    textSize(canvasWidth > 400 ? 18 : 14);
    text(currentScore, centerX, 105);
    
    // Level label and value
    fill('#00ccff');
    textSize(canvasWidth > 400 ? 12 : 10);
    text("LEVEL", centerX, 165);
    textSize(canvasWidth > 400 ? 18 : 14);
    text(currentLevel, centerX, 195);
    
    // Lines label and value
    fill('#ffcc00');
    textSize(canvasWidth > 400 ? 12 : 10);
    text("LINES", centerX, 250);
    textSize(canvasWidth > 400 ? 18 : 14);
    text(linesCleared, centerX, 280);
    
    // Next piece label
    fill('#ff00ff');
    textSize(canvasWidth > 400 ? 10 : 8);
    text("NEXT", centerX, 335);
    
    // Game area border
    stroke('#444444');
    strokeWeight(3);
    noFill();
    rect(gameEdgeLeft, 0, gameEdgeRight - gameEdgeLeft, height);
    
    fallingPiece.show();
    
    if(keyIsDown(DOWN_ARROW)) {
        updateEvery = 2;
    } else {
        updateEvery = updateEveryCurrent;
    }
    
    if(!pauseGame) {
        ticks++;
        if(ticks >= updateEvery) {
            ticks = 0;
            fallingPiece.fall(fallSpeed);
        }
    }
    
    for(let i = 0; i < gridPieces.length; i++) {
        gridPieces[i].show();
    }
    
    for(let i = 0; i < lineFades.length; i++) {
        lineFades[i].show();
    }
    
    if(gridWorkers.length > 0) {
        gridWorkers[0].work();
    }
    
    // Controls (left panel)
    textAlign(CENTER);
    fill('#ffffff');
    noStroke();
    textSize(canvasWidth > 400 ? 10 : 8);
    let leftCenterX = gameEdgeLeft / 2;
    
    fill('#00ff00');
    text("CONTROLS", leftCenterX, 150);
    
    fill('#ffffff');
    textSize(canvasWidth > 400 ? 8 : 7);
    text("← →", leftCenterX, 180);
    text("MOVE", leftCenterX, 200);
    text("↑", leftCenterX, 230);
    text("ROTATE", leftCenterX, 250);
    text("↓", leftCenterX, 280);
    text("SPEED UP", leftCenterX, 300);
    
    // Game over text with better visibility
    if(gameOver) {
        // Semi-transparent overlay
        fill(0, 0, 0, 200);
        noStroke();
        rect(0, 0, width, height);
        
        // Game Over text with shadow effect
        textFont('Press Start 2P');
        textAlign(CENTER);
        
        // Shadow
        fill(0);
        textSize(canvasWidth > 400 ? 52 : 36);
        text("GAME", width/2 + 3, height/2 - 30 + 3);
        text("OVER!", width/2 + 3, height/2 + 30 + 3);
        
        // Main text
        fill('#ff0000');
        textSize(canvasWidth > 400 ? 52 : 36);
        text("GAME", width/2, height/2 - 30);
        text("OVER!", width/2, height/2 + 30);
        
        // Restart instruction
        fill('#ffffff');
        textSize(canvasWidth > 400 ? 10 : 8);
        text("REFRESH TO", width/2, height/2 + 80);
        text("PLAY AGAIN", width/2, height/2 + 100);
    }
}

function lineBar(y, index) {
    this.pos = new p5.Vector(gameEdgeLeft, y);
    this.width = gameEdgeRight - gameEdgeLeft;
    this.index = index;

    this.show = function() {
        fill(255, 255, 255, 200);
        noStroke();
        rect(this.pos.x, this.pos.y, this.width, gridSpace);

        if(this.width + this.pos.x > this.pos.x) {
            this.width -= 10;
            this.pos.x += 5;
        } else {
            lineFades.splice(this.index, 1);
            gridWorkers.push(new worker(this.pos.y, gridSpace));
        }
    }
}

function keyPressed() {
    if(!pauseGame) {
        if(keyCode === LEFT_ARROW) {
            fallingPiece.input(LEFT_ARROW);
        } else if(keyCode === RIGHT_ARROW) {
            fallingPiece.input(RIGHT_ARROW);
        }
        if(keyCode === UP_ARROW) {
            fallingPiece.input(UP_ARROW);
        }
    }
}

function playPiece() {
    this.pos = new p5.Vector(0, 0);
    this.rotation = 0;
    this.nextPieceType = Math.floor(Math.random() * 7);
    this.nextPieces = [];
    this.pieceType = 0;
    this.pieces = [];
    this.orientation = [];
    this.fallen = false;
    
    this.nextPiece = function() {
        this.nextPieceType = pseudoRandom(this.pieceType);
        this.nextPieces = [];

        var points = orientPoints(this.nextPieceType, 0);
        let rightPanelX = gameEdgeRight + 10;
        let panelWidth = canvasWidth - gameEdgeRight - 20;
        var xx = rightPanelX + panelWidth/2, yy = 375;
        
        if(this.nextPieceType != 0 && this.nextPieceType != 3) {
            xx += (gridSpace * 0.5);
        }

        this.nextPieces.push(new square(xx + points[0][0] * gridSpace, yy + points[0][1] * gridSpace, this.nextPieceType));
        this.nextPieces.push(new square(xx + points[1][0] * gridSpace, yy + points[1][1] * gridSpace, this.nextPieceType));
        this.nextPieces.push(new square(xx + points[2][0] * gridSpace, yy + points[2][1] * gridSpace, this.nextPieceType));
        this.nextPieces.push(new square(xx + points[3][0] * gridSpace, yy + points[3][1] * gridSpace, this.nextPieceType));
    }
    
    this.fall = function(amount) {
        if(!this.futureCollision(0, amount, this.rotation)) {
            this.addPos(0, amount);
            this.fallen = true;
        } else {
            if(!this.fallen) {
                pauseGame = true;
                gameOver = true;
            } else {
                this.commitShape();
            }
        }
    }
    
    this.resetPiece = function() {
        this.rotation = 0;
        this.fallen = false;
        this.pos.x = gameEdgeLeft + (gameEdgeRight - gameEdgeLeft) / 2;
        this.pos.y = -60;
        
        this.pieceType = this.nextPieceType;
        
        this.nextPiece();
        this.newPoints();
    }
    
    this.newPoints = function() {
        var points = orientPoints(this.pieceType, this.rotation);
        this.orientation = points;
        this.pieces = [];
        this.pieces.push(new square(this.pos.x + points[0][0] * gridSpace, this.pos.y + points[0][1] * gridSpace, this.pieceType));
        this.pieces.push(new square(this.pos.x + points[1][0] * gridSpace, this.pos.y + points[1][1] * gridSpace, this.pieceType));
        this.pieces.push(new square(this.pos.x + points[2][0] * gridSpace, this.pos.y + points[2][1] * gridSpace, this.pieceType));
        this.pieces.push(new square(this.pos.x + points[3][0] * gridSpace, this.pos.y + points[3][1] * gridSpace, this.pieceType));
    }
    
    this.updatePoints = function() {
        if(this.pieces) {
            var points = orientPoints(this.pieceType, this.rotation);
            this.orientation = points;
            for(var i = 0; i < 4; i++) {
                this.pieces[i].pos.x = this.pos.x + points[i][0] * gridSpace;
                this.pieces[i].pos.y = this.pos.y + points[i][1] * gridSpace;  
            }
        }
    }
    
    this.addPos = function(x, y) {
        this.pos.x += x;
        this.pos.y += y;
        
        if(this.pieces) {
            for(var i = 0; i < 4; i++) {
                this.pieces[i].pos.x += x;
                this.pieces[i].pos.y += y;  
            }
        }
    }
    
    this.futureCollision = function(x, y, rotation) {
        var xx, yy, points = 0;
        if(rotation != this.rotation) {
            points = orientPoints(this.pieceType, rotation);
        }
        
        for(var i = 0; i < this.pieces.length; i++) {
            if(points) {
                xx = this.pos.x + points[i][0] * gridSpace;
                yy = this.pos.y + points[i][1] * gridSpace;  
            } else {
                xx = this.pieces[i].pos.x + x;
                yy = this.pieces[i].pos.y + y;
            }
            
            if(xx < gameEdgeLeft || xx + gridSpace > gameEdgeRight || yy + gridSpace > height) {
                return true;
            }
            
            for(var j = 0; j < gridPieces.length; j++) {
                if(xx === gridPieces[j].pos.x) {
                    if(yy >= gridPieces[j].pos.y && yy < gridPieces[j].pos.y + gridSpace) {
                        return true;
                    }
                    if(yy + gridSpace > gridPieces[j].pos.y && yy + gridSpace <= gridPieces[j].pos.y + gridSpace) {
                        return true;
                    }
                }
            }
        }
    }
    
    this.input = function(key) {
        switch(key) {
            case LEFT_ARROW:
                if(!this.futureCollision(-gridSpace, 0, this.rotation)) {
                    this.addPos(-gridSpace, 0);
                }
            break;
            case RIGHT_ARROW:
                if(!this.futureCollision(gridSpace, 0, this.rotation)) {
                    this.addPos(gridSpace, 0);
                }
            break;
            case UP_ARROW:
                var rotation = this.rotation + 1;
                if(rotation > 3) {
                    rotation = 0;
                }
                if(!this.futureCollision(gridSpace, 0, rotation)) {
                    this.rotate();
                }
            break;
        }
    }
    
    this.rotate = function() {
        this.rotation += 1;
        if(this.rotation > 3) {
            this.rotation = 0;
        }
        this.updatePoints();
    }
    
    this.show = function() {
        for(var i = 0; i < this.pieces.length; i++) {
            this.pieces[i].show();
        }
        for(var i = 0; i < this.nextPieces.length; i++) {
            this.nextPieces[i].show();
        }
    }
    
    this.commitShape = function() {
        for(var i = 0; i < this.pieces.length; i++) {
            gridPieces.push(this.pieces[i])
        }
        this.resetPiece();
        analyzeGrid();
    }
}

function square(x, y, type) {
    this.pos = new p5.Vector(x, y);
    this.type = type;
    
    this.show = function() {
        strokeWeight(2);
        var colorMid = colors[this.type];

        fill(colorMid);
        stroke(25);
        rect(this.pos.x, this.pos.y, gridSpace - 1, gridSpace - 1);

        noStroke();
        fill(255, 255, 255, 150); 
        rect(this.pos.x + 6, this.pos.y + 6, 18, 2);    
        rect(this.pos.x + 6, this.pos.y + 6, 2, 16);  
        fill(0, 0, 0, 100);
        rect(this.pos.x + 6, this.pos.y + 20, 18, 2);    
        rect(this.pos.x + 22, this.pos.y + 6, 2, 16); 
    }
}

function pseudoRandom(previous) {
    var roll = Math.floor(Math.random() * 8);
    if(roll === previous || roll === 7) {
        roll = Math.floor(Math.random() * 7);
    }
    return roll;
}

function analyzeGrid() {
    var score = 0;
    while(checkLines()) {
        score += 100;
        linesCleared += 1;
        if(linesCleared % 10 === 0) {
            currentLevel += 1;
            if(updateEveryCurrent > 4) {
                updateEveryCurrent -= 1;
            }
        }
    }
    if(score > 100) {
        score *= 2;
    }
    currentScore += score;
}

function checkLines() {
    var count = 0;
    var runningY = -1;
    var runningIndex = -1;
    
    gridPieces.sort(function(a, b) {
        return a.pos.y - b.pos.y;
    });
    
    for(var i = 0; i < gridPieces.length; i++) {
        if(gridPieces[i].pos.y === runningY) {
            count++;
            if(count === 10) {
                gridPieces.splice(runningIndex, 10);
                lineFades.push(new lineBar(runningY));
                return true;
            }
        } else {
            runningY = gridPieces[i].pos.y;
            count = 1;
            runningIndex = i;
        }
    }
    return false;
}

function worker(y, amount) {
    this.amountActual = 0;
    this.amountTotal = amount;
    this.yVal = y;

    this.work = function() {
        if(this.amountActual < this.amountTotal) {
            for(var j = 0; j < gridPieces.length; j++) {
                if(gridPieces[j].pos.y < y) {
                    gridPieces[j].pos.y += 5;
                }
            }
            this.amountActual += 5;
        } else {
            gridWorkers.shift();
        }
    }
}

function orientPoints(pieceType, rotation) {
    var results = [];
    switch(pieceType) {
        case 0:
            switch(rotation) {
                case 0: results = [[-2, 0], [-1, 0], [0, 0], [1, 0]]; break;
                case 1: results = [[0, -1], [0, 0], [0, 1], [0, 2]]; break;
                case 2: results = [[-2, 1], [-1, 1], [0, 1], [1, 1]]; break;
                case 3: results = [[-1, -1], [-1, 0], [-1, 1], [-1, 2]]; break;
            }
        break;
        case 1:
            switch(rotation) {
                case 0: results = [[-2, -1], [-2, 0], [-1, 0], [0, 0]]; break;
                case 1: results = [[-1, -1], [-1, 0], [-1, 1], [0, -1]]; break;
                case 2: results = [[-2, 0], [-1, 0], [0, 0], [0, 1]]; break;
                case 3: results = [[-1, -1], [-1, 0], [-1, 1], [-2, 1]]; break;
            }
        break;
        case 2:
            switch(rotation) {
                case 0: results = [[-2, 0], [-1, 0], [0, 0], [0, -1]]; break;
                case 1: results = [[-1, -1], [-1, 0], [-1, 1], [0, 1]]; break;
                case 2: results = [[-2, 0], [-2, 1], [-1, 0], [0, 0]]; break;
                case 3: results = [[-2, -1], [-1, -1], [-1, 0], [-1, 1]]; break;
            }
        break;
        case 3:
            results = [[-1, -1], [0, -1], [-1, 0], [0, 0]];
        break;
        case 4:
            switch(rotation) {
                case 0: results = [[-1, -1], [-2, 0], [-1, 0], [0, -1]]; break;
                case 1: results = [[-1, -1], [-1, 0], [0, 0], [0, 1]]; break;
                case 2: results = [[-1, 0], [-2, 1], [-1, 1], [0, 0]]; break;
                case 3: results = [[-2, -1], [-2, 0], [-1, 0], [-1, 1]]; break;
            }
        break;
        case 5:
            switch(rotation) {
                case 0: results = [[-2, 0], [-1, 0], [-1, -1], [0, 0]]; break;
                case 1: results = [[-1, -1], [-1, 0], [-1, 1], [0, 0]]; break;
                case 2: results = [[-2, 0], [-1, 0], [0, 0], [-1, 1]]; break;
                case 3: results = [[-2, 0], [-1, -1], [-1, 0], [-1, 1]]; break;
            }
        break;
        case 6:
            switch(rotation) {
                case 0: results = [[-2, -1], [-1, -1], [-1, 0], [0, 0]]; break;
                case 1: results = [[-1, 0], [-1, 1], [0, 0], [0, -1]]; break;
                case 2: results = [[-2, 0], [-1, 0], [-1, 1], [0, 1]]; break;
                case 3: results = [[-2, 0], [-2, 1], [-1, 0], [-1, -1]]; break;
            }
        break;
    }
    return results;
}