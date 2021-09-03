document.addEventListener('contextmenu', event => event.preventDefault());
var newGameBtn;
var modeButtons;
var board;
var mouse;

function setup() {
  var canvas = createCanvas(640, 640);
  canvas.parent('p5Div');
  newGameBtn = document.querySelector("#newGame");
  modeButtons = document.querySelectorAll(".mode");
  board = new Board();
  board.newGame();
  mouse = new p5.Vector(mouseX, mouseY);

  for (var i = 0; i < modeButtons.length; i++) {
    modeButtons[i].addEventListener("click", function() {
      modeButtons[0].classList.remove("selected");
      modeButtons[1].classList.remove("selected");
      this.classList.add("selected");
      if(this.textContent === "Easy") {
        board.numMines = 40;
        board.resetGame();
      } else if (this.textContent === "Hard") {
        board.numMines = 50;
        board.resetGame();
      } else if (this.textContent === "Crazy") {
        board.numMines = 65;
        board.resetGame();
      }
    });
  }

  newGameBtn.addEventListener("click", function() {
    board.resetGame();
  });

}

function draw() {
  background(51);
  mouse.set(mouseX, mouseY);
  board.show();
}

function mousePressed() {
  board.action();
}

function Board() {
  this.boardSize = 640;
  this.numMines = 40;
  this.tileSize = 40;
  this.boardWidth = 2 * (this.boardSize / this.tileSize) - 1;
  this.boardHeight = (this.boardSize / this.tileSize);
  this.lose = false;

  this.tiles = new Array(this.boardHeight);
  for (var i = 0; i < this.boardHeight; i++) {
    this.tiles[i] = new Array(this.boardWidth);
  }

  var a = new p5.Vector(0, 0);
  var b = new p5.Vector(this.tileSize / 2, this.tileSize);
  var c = new p5.Vector(this.tileSize, 0);
  var flag = false;

  for (var i = 0; i < this.boardHeight; i++) {
    for (var j = 0; j < this.boardWidth; j++) {
      this.tiles[i][j] = new Tile(a, b, c, flag);
      a = b.copy();
      b = c.copy();
      c = a.copy();
      c.x += this.tileSize;
      flag = !flag;
    }
    if (i % 2 == 0) {
      a.set(0, a.y + this.tileSize);
      c.set(a.x + this.tileSize, a.y);
      b.set(a.x + this.tileSize / 2, a.y - this.tileSize);
    } else {
      a.set(0, a.y + this.tileSize);
      c.set(this.tileSize, a.y);
      b.set(this.tileSize / 2, b.y + this.tileSize);
    }
  }
}

Board.prototype.show = function() {
  if (!this.win()) {
    this.showPlay();
  } else {
    this.showEnd();
  }
}

Board.prototype.showPlay = function() {
  for (var i = 0; i < this.boardHeight; i++) {
    for (var j = 0; j < this.boardWidth; j++) {
      this.tiles[i][j].show();
    }
  }
}

Board.prototype.showEnd = function() {
  fill(0, 0, 255);
  text("Congradulations!", this.boardSize / 3 + 50, this.boardSize / 2)
}

Board.prototype.action = function() {
  if (!this.lose) {
    for (var i = 0; i < this.boardHeight; i++) {
      for (var j = 0; j < this.boardWidth; j++) {
        if (mouseButton == LEFT) {
          if (this.tiles[i][j].click()) {
            if (this.tiles[i][j].mine) {
              this.lose = true;
              return;
            } else {
              this.lookAround(i, j);
            }
          }
        } else if (mouseButton == RIGHT) {
          this.tiles[i][j].cover();
        }
      }
    }
  }
}

Board.prototype.win = function() {
  var flag = true;
  for (var i = 0; i < this.boardHeight; i++) {
    for (var j = 0; j < this.boardWidth; j++) {
      if (!this.tiles[i][j].visited && !this.tiles[i][j].check && !this.tiles[i][j].mine) {
        flag = false;
      }
    }
  }
  return flag;
}

Board.prototype.newGame = function() {
  var count = 0;
  var ran;

  while (count < this.numMines) {
    ran = parseInt(random(this.boardHeight * this.boardWidth));
    var i = int(ran / this.boardWidth);
    var j = (ran % this.boardWidth);
    // console.log(i + " " + j);
    if (ran < (this.boardWidth * this.boardHeight) && !this.tiles[i][j].space) {
      this.tiles[i][j].space = true;
      this.tiles[i][j].mine = true;
      if (j - 1 >= 0) { //left
        if (i - 1 >= 0) { //left top
          this.tiles[i - 1][j - 1].counter++;
          if (!this.tiles[i][j].up && j - 2 >= 0) { //far left top
            this.tiles[i - 1][j - 2].counter++;
          }
        }
        if (i + 1 < this.boardHeight) { //left bottom
          this.tiles[i + 1][j - 1].counter++;
          if (this.tiles[i][j].up && j - 2 >= 0) { //far left bottom
            this.tiles[i + 1][j - 2].counter++;
          }
        }
        this.tiles[i][j - 1].counter++; //left middle
        if (j - 2 >= 0) {
          this.tiles[i][j - 2].counter++; //far left middle
        }
      }

      if (i - 1 >= 0) {
        this.tiles[i - 1][j].counter++; //top middle
      }
      if (i + 1 < this.boardHeight) {
        this.tiles[i + 1][j].counter++; //bottom middle
      }

      if (j + 1 < this.boardWidth) {
        if (i - 1 >= 0) {
          this.tiles[i - 1][j + 1].counter++; //top right
          if (!this.tiles[i][j].up && j + 2 < this.boardWidth) { //far top right
            this.tiles[i - 1][j + 2].counter++;
          }
        }
        if (i + 1 < this.boardHeight) {
          this.tiles[i + 1][j + 1].counter++; //bottom right
          if (this.tiles[i][j].up && j + 2 < this.boardWidth) { //far bottom right
            this.tiles[i + 1][j + 2].counter++;
          }
        }
        this.tiles[i][j + 1].counter++; // middle right
        if (j + 2 < this.boardWidth) {
          this.tiles[i][j + 2].counter++; //far middle right
        }
      }
      count++;
    }
  }
}

Board.prototype.resetGame = function() {
  for (var i = 0; i < this.boardHeight; i++) {
    for (var j = 0; j < this.boardWidth; j++) {
      this.tiles[i][j].resetTile();
    }
  }
  this.lose = false;
  this.newGame();
}

Board.prototype.lookAround = function(i, j) {
  if (!this.tiles[i][j].visited) {
    this.tiles[i][j].visited = true;
    this.tiles[i][j].check = true;
    if (this.tiles[i][j].counter == 0) {
      if (j - 1 >= 0) { //left
        if (i - 1 >= 0) { //left top
          this.lookAround(i - 1, j - 1);
          if (!this.tiles[i][j].up && j - 2 >= 0) { //far left top
            this.lookAround(i - 1, j - 2);
          }
        }
        if (i + 1 < this.boardHeight) { //left bottom
          this.lookAround(i + 1, j - 1);
          if (this.tiles[i][j].up && j - 2 >= 0) { //far left bottom
            this.lookAround(i + 1, j - 2);
          }
        }
        this.lookAround(i, j - 1); //left middle
        if (j - 2 >= 0) {
          this.lookAround(i, j - 2); //far left middle
        }
      }

      if (i - 1 >= 0) {
        this.lookAround(i - 1, j); //top middle
      }
      if (i + 1 < this.boardHeight) {
        this.lookAround(i + 1, j); //bottom middle
      }

      if (j + 1 < this.boardWidth) {
        if (i - 1 >= 0) {
          this.lookAround(i - 1, j + 1); //top right
          if (!this.tiles[i][j].up && j + 2 < this.boardWidth) { //far top right
            this.lookAround(i - 1, j + 2);
          }
        }
        if (i + 1 < this.boardHeight) {
          this.lookAround(i + 1, j + 1); //bottom right
          if (this.tiles[i][j].up && j + 2 < this.boardWidth) { //far bottom right
            this.lookAround(i + 1, j + 2);
          }
        }
        this.lookAround(i, j + 1); // middle right
        if (j + 2 < this.boardWidth) {
          this.lookAround(i, j + 2); //far middle right
        }
      }
    }
  }
}

function Tile(a, b, c, dir) {
  this.p1 = new p5.Vector;
  this.p2 = new p5.Vector;
  this.p3 = new p5.Vector;

  this.p1 = a.copy();
  this.p2 = b.copy();
  this.p3 = c.copy();

  this.counter = 0;

  this.red = false;
  this.visited = false;
  this.space = false;
  this.check = false;
  this.mine = false;
  this.up = dir;
}

Tile.prototype.resetTile = function() {
  this.counter = 0;
  this.red = false;
  this.visited = false;
  this.space = false;
  this.check = false;
  this.mine = false;
}

Tile.prototype.show = function() {
  var tileSize = int(this.p3.x - this.p1.x);
  stroke(0);
  strokeWeight(1);
  if (this.red) {
    fill(255, 0, 0);
    triangle(this.p1.x, this.p1.y, this.p2.x, this.p2.y, this.p3.x, this.p3.y);
  } else if (this.check) {
    fill(255);
    triangle(this.p1.x, this.p1.y, this.p2.x, this.p2.y, this.p3.x, this.p3.y);
    if (this.mine) {
      fill(51);
      ellipse(this.p2.x - 2, (this.p1.y + this.p2.y + this.p3.y) / 3, tileSize / 4, tileSize / 4);
    } else {
      strokeWeight(2); 
      if (this.counter == 0) {
        fill(255);
        stroke(255); 
      } else if (this.counter == 1) {
        fill(0, 0, 255);
        stroke(0, 0, 255); 
      } else if (this.counter == 2) {
        fill(0, 255, 0);
        stroke(56, 169, 58); 
      } else if (this.counter == 3) {
        fill(211, 222, 39);
        stroke(167, 173, 62); 
      } else if (this.counter == 4) {
        fill(255, 75, 0);
        stroke(255, 75, 0); 
      } else if (this.counter > 4) {
        fill(255, 0, 0);
        stroke(255, 0, 0); 
      } 
      text(this.counter, this.p2.x - 2, (this.p1.y + this.p2.y + this.p3.y) / 3);
    }
  } else {
    fill(175);
    triangle(this.p1.x, this.p1.y, this.p2.x, this.p2.y, this.p3.x, this.p3.y);
  }
}

Tile.prototype.cover = function() {
  if (PointInTriangle(mouse, this.p1, this.p2, this.p3) && !this.check) {
    this.red = !this.red;
  }
}

Tile.prototype.click = function() {
  if (!this.red && !this.check && PointInTriangle(mouse, this.p1, this.p2, this.p3)) {
    this.check = true;
    return (this.mine || this.counter == 0);
  }
  return false;
}

function PointInTriangle(p, p1, p2, p3) {
  var alpha = ((p2.y - p3.y) * (p.x - p3.x) + (p3.x - p2.x) * (p.y - p3.y)) / ((p2.y - p3.y) * (p1.x - p3.x) + (p3.x - p2.x) * (p1.y - p3.y));
  var beta = ((p3.y - p1.y) * (p.x - p3.x) + (p1.x - p3.x) * (p.y - p3.y)) / ((p2.y - p3.y) * (p1.x - p3.x) + (p3.x - p2.x) * (p1.y - p3.y));
  var gamma = 1.0 - alpha - beta;

  return (alpha > 0 && beta > 0 && gamma > 0);
}
