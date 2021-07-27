const canvas = document.getElementById("canvas");
ctx = canvas.getContext('2d');
canvas.width = innerWidth / 1.1;
canvas.height = 450;

//declaring variables
var spaceshipImg = document.getElementById("spaceshipImg");
var alienImg = document.getElementById('alienImg');
var scoreDisplay = document.getElementById('score');
var killDisplay = document.getElementById('kill');
var levelDisplay = document.getElementById('level');
var levelCanvas = document.getElementById('levelCanvas');
var pause = document.getElementById('pause');
var input = document.getElementById('yourName');
var newGame = document.getElementById('newGame');
var highScore = document.getElementById('highScore');
var highName = document.getElementById('highName');
var popup = document.getElementById("popup");
var popupText = document.getElementById('popupText');

// audio switch on/off variables
var mute = document.getElementById('muteImg')
var unmute = document.getElementById('unmuteImg')
var musicOn = document.getElementById('musicOnImg')
var musicOff = document.getElementById('musicOffImg')

// audio
var shootSound = new Audio('./assets/audio/shoot.mp3');
var enemyDieSound = new Audio('./assets/audio/enemyDie.mp3');
var levelUpSound = new Audio('./assets/audio/levelUp.mp3');
var gameOverSound = new Audio('./assets/audio/gameOver.mp3');
var clickSound = new Audio('./assets/audio/click.mp3');
var backgroundSound = new Audio('./assets/audio/background.mp3');
backgroundSound.loop = true;

// default size
var spaceshipSize = 75;
var enemySize = 50;
var bulletWidth = 15;
var bulletHeight = 5;

// default positions
var spaceshipLeft = 0;
var spaceshipTop = canvas.height / 2 - spaceshipSize / 2;
var enemyLeft;
var enemyTop;
var bulletLeft;
var bulletTop;

// default speeds
var spaceshipSpeed = 25;
var enemySpeed = 1;
var bulletSpeed = 5;

// initial scores
var count = 0;
var score = 0;
var kills = 0;
var level = 1;
var totalEnemies = 0;
var enemyMatrix = 1;
var bullets = []
var enemies = []

var nameDisplay;
var requestID;
var enemyDistance = 70;

// initial conditions
var movingUp = false;
var movingDown = false;
var movingLeft = false;
var movingRight = false;
popupText.innerHTML = `Click New Game Button to start the game!`;
canvas.classList.add('disabled');

//local Storage
var scoreLocal;
if (localStorage.getItem("highScore") == null) {
    var scoreLocal = [
        {
            'hscore': 0,
            'hname': "N/A"
        }
    ]
} else {
    scoreLocal = JSON.parse(localStorage.getItem("highScore"));
}

// resize browser
addEventListener('resize', () => {
    canvas.width = innerWidth / 1.1;
    canvas.height = 450;
});

// utility function
function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}

// class
class DrawBullet {
    constructor(x, y, width, height, speed) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.speed = speed
    }
    draw() {
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = '#fa4437';
        ctx.fill();
        ctx.closePath();
    }
    update() {
        this.draw();
        this.x += this.speed;
    }
}

class DrawEnemy {
    constructor(x, y, size, speed, strength) {
        this.x = x
        this.y = y
        this.size = size
        this.speed = speed
        this.strength = strength
    }
    draw() {
        var alienImg = new Image(this.size, this.size)
        alienImg.src = `./assets/images/aliens/alien${this.strength}.png`
        ctx.drawImage(alienImg, this.x, this.y, this.size, this.size);
    }
    update() {
        this.draw();
        this.x -= this.speed;
    }
}

// functions
function update() {
    //updating other functions
    enemyPlayerCollision();
    enemyBulletCollision();

    // spaceship - drawing player
    ctx.drawImage(spaceshipImg, spaceshipLeft, spaceshipTop, spaceshipSize, spaceshipSize);

    bullets.forEach((bullet, index) => {
        bullet.update();

        // removing the bullets once they go out of the canvas area
        if (bullet.x > canvas.width) {
            bullets.splice(index, 1);
        }
    })

    enemies.forEach((enemy, index) => {
        enemy.update();

        // removing the enemies once they go out of the canvas area
        if (enemy.x < - enemyDistance * enemyMatrix) {
            enemies.splice(index, 1);
        }
    })

    // scoring
    count++;
    score = Math.floor(count / 20)
    scoreDisplay.innerHTML = "Score - " + score
}

function spawnEnemy() {
    var k = setInterval(() => {
        enemyLeft = canvas.width + 1;
        enemyTop = getRandomNumber(0, canvas.height - enemyDistance * enemyMatrix);
        fireLeft = enemyLeft;
        fireTop = enemyTop;
        for (let row = 0; row < enemyMatrix; row++) {
            for (let column = 0; column < enemyMatrix; column++) {
                // different strengths of aliens
                if (level > 0 && level < 5) {
                    var strength = Math.floor(getRandomNumber(1, level + 2))
                } else if (level >= 5) {
                    var strength = Math.floor(getRandomNumber(1, 6))
                }

                    enemies.push(new DrawEnemy(enemyLeft + row * enemyDistance, enemyTop + column * enemyDistance, enemySize, enemySpeed, strength))
            }
        }
        totalEnemies++
    }, 1000 + 1000 * level)
    setInterval(() => {
        if (totalEnemies > 3) {
            if (enemies.length == 0) {
                levelUpSound.play();
                count += 200
                level++
                levelDisplay.innerHTML = "Level - " + level
                levelCanvas.innerHTML = "Level - " + level
                levelCanvas.classList.remove("hide")
                totalEnemies = 0;
                spawnEnemy();
                setTimeout(() => {
                    levelCanvas.classList.add("hide")
                    enemyMatrix++
                    if (level == 4) {
                        enemyDistance = 60
                    }
                    if (level > 4) {
                        enemySize = 50 - level * 2
                        enemyDistance = enemySize + 5
                    }
                }, 1000 * level)
            }
            clearTimeout(k)
        }
    }, 10)
}

function spawnBullet() {
    shootSound.play();
    bulletLeft = spaceshipLeft + spaceshipSize;
    bulletTop = spaceshipTop + spaceshipSize / 2 - bulletHeight / 2;
    bullets.push(new DrawBullet(bulletLeft, bulletTop, bulletWidth, bulletHeight, bulletSpeed))
}

document.addEventListener('keyup', (event) => { // space
    if (event.keyCode == 32) {
        event.preventDefault();
        spawnBullet();
    }
})

canvas.addEventListener('click', () => { // click
    spawnBullet();
})

document.addEventListener('keydown', (event) => {
    if (event.keyCode == 38 || event.keyCode == 87) { // up - w
        event.preventDefault();
        if (spaceshipTop < 0 + spaceshipSpeed) {
            movingUp = false;
        } else {
            movingUp = true;
        }
    } else if (event.keyCode == 40 || event.keyCode == 83) { // down - s
        event.preventDefault();
        if (spaceshipTop > canvas.height - spaceshipSize - spaceshipSpeed) {
            movingDown = false;
        } else {
            movingDown = true;
        }
    } else if (event.keyCode == 37 || event.keyCode == 65) { // left - a
        event.preventDefault();
        if (spaceshipLeft < 0 + spaceshipSpeed) {
            movingLeft = false;
        } else {
            movingLeft = true;
        }
    } else if (event.keyCode == 39 || event.keyCode == 68) { // right - d
        event.preventDefault();
        if (spaceshipLeft > canvas.width - spaceshipSize - spaceshipSpeed) {
            movingRight = false;
        } else {
            movingRight = true;
        }
    }

    if (spaceshipTop < 0 + spaceshipSpeed) {
        movingUp = false;
    }
    if (spaceshipTop > canvas.height - spaceshipSize - spaceshipSpeed) {
        movingDown = false;
    }
    if (spaceshipLeft < 0 + spaceshipSpeed) {
        movingLeft = false;
    }
    if (spaceshipLeft > canvas.width - spaceshipSize - spaceshipSpeed) {
        movingRight = false;
    }

    movingPlayer();
});

document.addEventListener('keyup', (event) => {
    if (event.keyCode == 38 || event.keyCode == 87) { // up - w
        event.preventDefault();
        movingUp = false;
    } else if (event.keyCode == 40 || event.keyCode == 83) { // down - s
        event.preventDefault();
        movingDown = false;
    } else if (event.keyCode == 37 || event.keyCode == 65) { // left - a
        event.preventDefault();
        movingLeft = false;
    } else if (event.keyCode == 39 || event.keyCode == 68) { // right - d
        event.preventDefault();
        movingRight = false;
    }

    movingPlayer();
});

function movingPlayer() {
    if (movingUp == true) { // up
        spaceshipTop -= spaceshipSpeed
    }
    if (movingDown == true) { // down
        spaceshipTop += spaceshipSpeed
    }
    if (movingLeft == true) { // left
        spaceshipLeft -= spaceshipSpeed
    }
    if (movingRight == true) { // right
        spaceshipLeft += spaceshipSpeed
    }
}

function enemyBulletCollision() {
    enemies.forEach((enemy, i) => {
        bullets.forEach((bullet, j) => {
            if (enemy.x - bullet.x < bulletWidth && bullet.y - enemy.y < enemySize && bullet.y - enemy.y > 0) {
                enemyDieSound.play();
                setTimeout(() => {
                    if (enemy.strength == 1) {
                        kills++
                        count += 100
                        killDisplay.innerHTML = "Kills - " + kills
                        enemies.splice(i, 1)
                        bullets.splice(j, 1)
                    } else if (enemy.strength > 1) {
                        enemy.strength -= 1
                        bullets.splice(j, 1)
                    }
                }, 0)
            }
        })
    })
}

function enemyPlayerCollision() {
    enemies.forEach((enemy, index) => {
        if (Math.abs(enemy.x - spaceshipLeft) < spaceshipSize && Math.abs(spaceshipTop - enemy.y) < enemySize) {
            gameOverSound.play();
            gameOver();
            saveScore();
            cancelAnimationFrame(requestID);
        }
    })
}

function animate() {
    requestID = requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    update();
}

// saving highscore
function saveScore() {
    if (score > scoreLocal[0].hscore) {
        scoreLocal[0].hscore = score;
        scoreLocal[0].hname = nameDisplay;
    }
    localStorage.setItem("highScore", JSON.stringify(scoreLocal))

    //showing high score
    highScore.innerHTML = scoreLocal[0].hscore;
    highName.innerHTML = scoreLocal[0].hname;
}
saveScore();

// event listener on New Game button
newGame.addEventListener('click', () => {
    if (count > 1) {
        cancelAnimationFrame(requestID);
        newGameFunc();
    } else {
        newGameFunc();
    }
})

//pause button
pause.addEventListener('click', () => {
    if (pause.innerHTML == "Pause") {
        pause.innerHTML = "Play"
        cancelAnimationFrame(requestID);
        backgroundSound.pause();
        popupText.innerHTML = `The game is being paused! <br> To continue, press Play button`;
        popup.classList.remove('hide');
        canvas.classList.add('disabled');
    } else if (pause.innerHTML == "Play") {
        pause.innerHTML = "Pause"
        requestID = requestAnimationFrame(animate);
        backgroundSound.play();
        popup.classList.add('hide');
        canvas.classList.remove('disabled');
    } else if (pause.innerHTML == "New Game") {
        newGameFunc();
    }
})

//game over
function gameOver() {
    backgroundSound.pause();
    pause.innerHTML = "New Game";
    input.disabled = false;
    popupText.innerHTML = `Hey ${nameDisplay}! <br> The games over! <br> Your Score: ${score}`;
    popup.classList.remove('hide');
    canvas.classList.add('disabled');
}

function newGameFunc() {
    backgroundSound.currentTime = 0;
    backgroundSound.play();
    popup.classList.add('hide');
    canvas.classList.remove('disabled');
    nameDisplay = input.value;
    input.disabled = true;
    pause.innerHTML = "Pause";

    // new game initial variables
    spaceshipSize = 75;
    enemySize = 50;
    bulletWidth = 15;
    bulletHeight = 5;

    spaceshipLeft = 0;
    spaceshipTop = canvas.height / 2 - spaceshipSize / 2;

    spaceshipSpeed = 25;
    enemySpeed = 1;
    bulletSpeed = 5;

    count = 0;
    score = 0;
    kills = 0;
    level = 1;
    scoreDisplay.innerHTML = "Score - " + score;
    killDisplay.innerHTML = "Kills - " + kills;
    levelDisplay.innerHTML = "Level - " + level;

    totalEnemies = 0;
    enemyMatrix = 1;
    bullets = []
    enemies = []
    enemyDistance = 70;

    movingUp = false;
    movingDown = false;
    movingLeft = false;
    movingRight = false;

    animate();
    spawnEnemy();
}

// sounds event listener
unmute.addEventListener('click', () => {
    mute.classList.remove("hide");
    unmute.classList.add("hide");
    shootSound.muted = true;
    levelUpSound.muted = true;
    enemyDieSound.muted = true;
    gameOverSound.muted = true;
    clickSound.muted = true;
})
mute.addEventListener('click', () => {
    mute.classList.add("hide");
    unmute.classList.remove("hide");
    shootSound.muted = false;
    levelUpSound.muted = false;
    enemyDieSound.muted = false;
    gameOverSound.muted = false;
    clickSound.muted = false;
    clickSound.play();
})
musicOff.addEventListener('click', () => {
    musicOn.classList.remove("hide");
    musicOff.classList.add("hide");
    backgroundSound.muted = false;
})
musicOn.addEventListener('click', () => {
    musicOn.classList.add("hide");
    musicOff.classList.remove("hide");
    backgroundSound.muted = true;
})