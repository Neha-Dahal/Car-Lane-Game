const HEALTH = 1;
const ENEMY_GAP = 100;
const TRACK_WIDTH = 300;
const TRACK_HEIGHT = 600;
const LANES = 3;
const INITIAL_X = 0;
const INITIAL_Y = 0;
const BLOCK_HEIGHT = 100;
const BLOCK_WIDTH = Math.abs(TRACK_WIDTH / LANES);
const POSSIBLE_X = getPossibleX(BLOCK_WIDTH, LANES);
const BULLET_SIZE = 10;
const BULLET_SPEED = 10;

let speed = 5;

let count = 0;
let speedIncrement = 0.4;

function getPossibleX(value, length) {
  let arr = [];
  for (let i = 0; i < length; i++) {
    arr.push(value * i);
  }
  return arr;
}

function filterNull(arr) {
  return arr.filter(Boolean);
}

function checkParentNode(parentNode, childNode) {
  if ("contains" in parentNode) {
    return parentNode.contains(childNode);
  } else {
    return parentNode.compareDocumentPosition(childNode) % 16;
  }
}

class Bullet {
  constructor(props) {
    this.x = props.x || 0;
    this.y = props.y || 0;
    this.dy = BULLET_SPEED;
    this.init();
  }

  init() {
    let bulletElem = document.createElement("div");
    bulletElem.className = "bullet";
    this.element = bulletElem;
  }

  render() {
    this.element.style.left = this.x + "px";
    this.element.style.top = this.y + "px";
  }

  update() {
    this.y -= this.dy;
    this.element.style.top = this.y + "px";
  }
}

class Car {
  constructor(props) {
    this.x = props.x;
    this.y = props.y;
    this.health = HEALTH;
    this.speed = speed;
    this.init();
  }

  init() {
    let carElem = document.createElement("div");
    carElem.className = "car";
    this.element = carElem;
  }

  reset() {
    this.x = TRACK_WIDTH / 2 - BLOCK_WIDTH / 2;
    this.y = TRACK_HEIGHT - BLOCK_HEIGHT;
    this.health = 1;
    this.element.style.left = this.x + "px";
    this.element.style.top = this.y + "px";
  }

  render() {
    this.element.style.left = this.x + "px";
    this.element.style.top = this.y + "px";
  }

  moveX(keyCode) {
    if (keyCode === 37) {
      if (this.x >= BLOCK_WIDTH) {
        this.x -= BLOCK_WIDTH;
        this.render();
      }
    }
    if (keyCode === 39) {
      if (this.x <= BLOCK_WIDTH + 36) {
        this.x += BLOCK_WIDTH;
        this.render();
      }
    }
  }
}

class Obstacle {
  constructor(props) {
    this.x = props.x;
    this.y = props.y;
    this.dy = speed;
    this.health = HEALTH;
    this.init();
  }

  init() {
    let obsElem = document.createElement("div");
    obsElem.className = "obstacle";
    this.element = obsElem;
  }

  render() {
    this.element.style.left = this.x + "px";
    this.element.style.top = this.y + "px";
  }

  update() {
    this.y += this.dy;
    this.element.style.top = this.y + "px";
  }

  decreaseHealth() {
    this.health = 0;
  }
}

class Screen {
  constructor(props) {
    this.screenName = props.screenName;
    this.init();
  }

  init() {
    let screenElem = document.createElement("div");
    screenElem.className = this.screenName;
    this.element = screenElem;
  }

  display() {
    this.element.style.display = "block";
  }

  hide() {
    this.element.style.display = "none";
  }
}

class World {
  constructor(props) {
    this.parentElement = props.element;
    this.car = new Car({
      x: TRACK_WIDTH / 2 - BLOCK_WIDTH / 2,
      y: TRACK_HEIGHT - BLOCK_HEIGHT,
    });
    this.obstacles = [];
    this.bullets = [];
    this.distance = 0;
    this.isGameActive = false;
    this.scoreInit();
  }

  scoreInit() {
    let scoreElem = document.createElement("span");
    scoreElem.className = "score";
    this.scoreElement = scoreElem;
    let healthElem = document.createElement("span");
    healthElem.className = "car-health";
    this.healthElement = healthElem;
  }

  render() {
    this.car.render();
    this.obstacles.forEach((obstacle) => {
      obstacle.render();
    });
  }

  gameEvent() {
    document.addEventListener("keydown", this.onKeyDownMove);
    document.addEventListener("keypress", this.onKeyPressShoot);
  }

  onKeyDownMove = (key) => {
    if (this.isGameActive) {
      this.car.moveX(key.keyCode);
    }
  };

  moveLeft = () => {
    if (this.isGameActive) {
      if (this.car.x >= BLOCK_WIDTH) {
        this.car.x -= BLOCK_WIDTH;
        this.car.render();
      }
    }
  };

  moveRight = () => {
    if (this.isGameActive) {
      if (this.car.x <= BLOCK_WIDTH + 36) {
        this.car.x += BLOCK_WIDTH;
        this.car.render();
      }
    }
  };

  onKeyPressShoot = (key) => {
    if ((key.keyCode === 32 || key.which === 32) && this.isGameActive) {
      this.createBullet();
    }
  };

  forBullet = () => {
    if (this.isGameActive) {
      this.createBullet();
    }
  };

  resetEventHandler() {
    document.removeEventListener("keydown", this.onKeyDownMove);
    document.removeEventListener("keypress", this.onKeyPressShoot);
  }

  gameLoop() {
    let id = setInterval(() => {
      this.updateBackground();
      this.checkDistance();
      this.obstacles.forEach((obstacle) => {
        this.obstacles = filterNull(this.obstacles);
        obstacle.update();
      });

      if (this.distance % 150 === 0) {
        speed += speedIncrement;
      }
      if (this.distance >= 6000) {
        console.log(`You completed the game. Score: ${this.distance}`);
        this.isGameActive = false;
        clearInterval(id);
        this.parentElement.removeChild(this.healthElement);
        this.parentElement.removeChild(this.scoreElement);
        this.createGameOverScreen();
      } else if (Math.round(this.car.health) <= 0) {
        console.log(`Game Over!`);
        this.isGameActive = false;
        clearInterval(id);
        this.parentElement.removeChild(this.healthElement);
        this.parentElement.removeChild(this.scoreElement);
        this.createGameOverScreen();
      }
      this.checkObstacleCollision();

      this.updateObstacles();
      this.updateBullet();

      this.showScore();
    }, 20);
  }

  append() {
    this.parentElement.appendChild(this.car.element);
    this.obstacles.forEach((obstacle) => {
      this.parentElement.appendChild(obstacle.element);
    });
    this.parentElement.appendChild(this.healthElement);
    this.parentElement.appendChild(this.scoreElement);
  }

  createObstacle() {
    const randomValues = [];

    while (randomValues.length < 2) {
      const randomIndex = Math.floor(Math.random() * POSSIBLE_X.length);
      const randomValue = POSSIBLE_X[randomIndex];

      if (!randomValues.includes(randomValue)) {
        randomValues.push(randomValue);
      }
    }

    return randomValues.forEach((value) =>
      this.obstacles.push(
        new Obstacle({
          x: value,
          y: -30,
        })
      )
    );
  }

  createBullet() {
    let bullet = new Bullet({
      x: this.car.x + BLOCK_WIDTH / 2 - BULLET_SIZE / 2,
      y: this.car.y,
    });
    bullet.render();
    this.parentElement.appendChild(bullet.element);
    this.bullets.push(bullet);
  }

  reset() {
    this.car.reset();
    this.distance = 0;
    this.bullets.forEach((bullet) => {
      if (checkParentNode(this.parentElement, bullet.element)) {
        this.parentElement.removeChild(bullet.element);
      }
    });
    this.bullets = [];
    this.obstacles.forEach((obs) => {
      if (checkParentNode(this.parentElement, obs.element)) {
        this.parentElement.removeChild(obs.element);
      }
    });
    this.obstacles = [];
  }

  createHomeScreen() {
    let homeScreen = new Screen({
      screenName: "home-screen",
    });
    this.parentElement.appendChild(homeScreen.element);
    let startBtn = document.createElement("button");
    startBtn.className = "home-screen-start-button";
    startBtn.innerHTML = "START";
    homeScreen.element.appendChild(startBtn);
    homeScreen.display();
    startBtn.onclick = () => {
      homeScreen.hide();
      this.reset();
      this.init();
    };
  }

  createGameOverScreen() {
    let gameOverScreen = new Screen({
      screenName: "game-over-screen",
    });
    this.parentElement.appendChild(gameOverScreen.element);
    gameOverScreen.display();
    let gameOverText = document.createElement("div");
    gameOverText.className = "result-screen-game-over";
    gameOverText.innerHTML = "<p>Game Over</p>";
    gameOverScreen.element.appendChild(gameOverText);
    gameOverScreen.element.appendChild(document.createElement("hr"));

    let scoreBoard = document.createElement("div");
    scoreBoard.className = "score-board";
    gameOverScreen.element.appendChild(scoreBoard);
    scoreBoard.textContent = "Final Score: " + this.distance;

    let tryAgainBtn = document.createElement("button");
    tryAgainBtn.className = "try-again-button";
    tryAgainBtn.textContent = "Try Again!";
    gameOverScreen.element.appendChild(tryAgainBtn);
    gameOverScreen.element.appendChild(document.createElement("hr"));
    tryAgainBtn.onclick = () => {
      gameOverScreen.hide();
      this.resetEventHandler();
      this.createHomeScreen();
    };
  }

  checkDistance() {
    this.distance += 1;
    if (this.distance % ENEMY_GAP === 0) {
      this.createObstacle();
      this.obstacles.forEach((obstacle) => {
        obstacle.render();
        this.parentElement.appendChild(obstacle.element);
      });
    }
  }

  checkObstacleCollision() {
    for (let i = 0; i < this.obstacles.length; i++) {
      let obs = this.obstacles[i];
      if (
        obs.x + BLOCK_WIDTH > this.car.x &&
        obs.x < this.car.x + BLOCK_WIDTH &&
        obs.y + BLOCK_HEIGHT > this.car.y &&
        obs.y < BLOCK_HEIGHT + this.car.y
      ) {
        obs.decreaseHealth();
        this.car.health = 0;
        if (obs.element.parentNode !== null) {
          this.parentElement.removeChild(obs.element);
        }
      }
    }
  }

  checkBulletCollision(bullet) {
    for (let i = 0; i < this.obstacles.length; i++) {
      let obs = this.obstacles[i];
      if (
        obs.x + BLOCK_WIDTH > bullet.x &&
        obs.x < bullet.x + BULLET_SIZE &&
        obs.y + BLOCK_HEIGHT > bullet.y &&
        obs.y < BULLET_SIZE + bullet.y
      ) {
        return obs;
      }
    }
    return null;
  }

  updateBullet() {
    for (let i = 0; i < this.bullets.length; i++) {
      let bullet = this.bullets[i];
      bullet.update();
      let strokeObs = this.checkBulletCollision(bullet);
      if (strokeObs) {
        strokeObs.decreaseHealth();
      }
      if (bullet.y < 0 || strokeObs) {
        this.bullets[i] = null;
        if (checkParentNode(this.parentElement, bullet.element)) {
          this.parentElement.removeChild(bullet.element);
        }
      }
    }
    this.bullets = filterNull(this.bullets);
  }

  updateObstacles() {
    for (let i = 0; i < this.obstacles.length; i++) {
      let obstacle = this.obstacles[i];
      if (obstacle.y >= TRACK_HEIGHT - 30 || obstacle.health <= 0) {
        this.obstacles[i] = null;
        if (checkParentNode(this.parentElement, obstacle.element)) {
          this.parentElement.removeChild(obstacle.element);
        }
      }
    }
    this.obstacles = filterNull(this.obstacles);
  }

  updateBackground() {
    this.parentElement.style.backgroundPosition =
      "0px " + this.distance * 2 + "px";
  }

  showScore() {
    this.scoreElement.textContent = `SCORE: ${this.distance}`;
  }

  init() {
    this.isGameActive = true;
    this.createObstacle();
    this.gameEvent();
    this.gameLoop();
    this.append();
    this.render();
  }
}

const game = new World({
  element: document.querySelector(".race-container"),
});

game.createHomeScreen();
