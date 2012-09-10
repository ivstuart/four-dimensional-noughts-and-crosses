if (window.navigator.appName != "Microsoft Internet Explorer") {
	window.location = "notcompatible.html"
}

var gameState;
var gameTurn;
var playerTurn;
var oPlayerTurn;

var Player;
var Plane;
var Cell;

var Winner;
var Computer;
var gameOver;

var bestScore;
var score;
var countYours;
var countOpponents;
var Location;
var level;
var aggression;
var defence;

var number;
var countTwoYours;
var countTwoOpponents;

function init() {
	// alert("DECL:init()");
	Player = new Array(3);
	Plane = new Array(4);
	Cell = new Array(4);

	Player[0] = new Image();
	Player[0].src = "blank.gif";
	Player[1] = new Image();
	Player[1].src = "nought.gif";
	Player[2] = new Image();
	Player[2].src = "cross.gif";

	Computer = new Array(3);
	Location = new Array(16);

	Winner = new Image();
	Winner.src = "serraangel.gif";
	window.document.setgame.players[0].checked = false;
	window.document.setgame.players[1].checked = false;
	window.document.setgame.players[2].checked = true;
	resetGame();
}

function makeCpuMove(guess) {
	// alert("DECL:makeCpuMove()"+guess);
	x = guess % 4;
	y = Math.floor((guess % 16) / 4);
	z = Math.floor(guess / 16);
	makeMove(x, y, z, false);
}

function selectRandomMove(number) {
	if (number == null) {
		number = Math.floor(64 * Math.random());
	}

	var guess = ++number;
	if (guess > 63) {
		guess = 0
	}
	x = guess % 4;
	y = Math.floor((guess % 16) / 4);
	z = Math.floor(guess / 16);

	if (Plane[x][y][z] != 0) {
		return selectRandomMove(guess);
	}
	return guess;
}

function selectBestMove() {
	// alert("DECL:selectBestMove");
	if (level == 0) {
		makeCpuMove(selectRandomMove());
		return;
	}

	// Initialise variables
	var locationCounter = 0;
	var arrayCounter = 0;
	score = 0;
	bestScore = 1;

	// Loop through every location
	for ( var i = 0; i < 4; i++) {
		for ( var j = 0; j < 4; j++) {
			for ( var k = 0; k < 4; k++) {
				if (Plane[k][j][i] == 0) {
					score = checkScore(k, j, i);
					if (score >= bestScore) {
						if (score > bestScore) {
							// alert("Low level check of score = " + score);
							bestScore = score;
							arrayCounter = 0;
						}
						Location[arrayCounter] = locationCounter;
						arrayCounter++;
					}
				}
				locationCounter++;
			}
		}
	}

	// alert("Debug player = " + playerTurn + " oplayer = " + oPlayerTurn);

	if ((arrayCounter == 0) || (level == 1 && bestScore < 100)) {
		makeCpuMove(selectRandomMove());
		return;
	}

	// alert("AI Best Score = " + bestScore+ " occurs = " + arrayCounter);
	var choice = Math.floor(arrayCounter * Math.random());

	makeCpuMove(Location[choice]);
}

function checkScore(x, y, z) {
	var scored = 0;
	countTwoYours = 0;
	countTwoOpponents = 0;
	scored += scoreRow(x, y, z, 1, 0, 0);
	scored += scoreRow(x, y, z, 0, 1, 0);
	scored += scoreRow(x, y, z, 0, 0, 1);
	scored += scoreRow(x, y, z, 1, 1, 0);
	scored += scoreRow(x, y, z, 1, -1, 0);
	scored += scoreRow(x, y, z, 0, 1, 1);
	scored += scoreRow(x, y, z, 0, 1, -1);
	scored += scoreRow(x, y, z, 1, 0, 1);
	scored += scoreRow(x, y, z, 1, 0, -1);
	scored += scoreRow(x, y, z, 1, 1, 1);
	scored += scoreRow(x, y, z, 1, -1, 1);
	scored += scoreRow(x, y, z, -1, 1, 1);
	scored += scoreRow(x, y, z, 1, 1, -1);
	if (level == 4) {
		if (countTwoYours > 1) {
			scored += 50;
		}
		if (countTwoOpponents > 1) {
			scored += 25;
		}
	}
	return scored;
}

function initLineScore() {
	countYours = 0;
	countOpponents = 0;
}

function scoreRow(x, y, z, dx, dy, dz) {

	// First add direction until come to point outside the cube
	x_temp = x + dx;
	y_temp = y + dy;
	z_temp = z + dz;

	// Then reserve the direction and do a checkLine() from there
	if (x_temp < 0 || x_temp > 3 || y_temp < 0 || y_temp > 3 || z_temp < 0
			|| z_temp > 3) {
		initLineScore();
		return scoreLine(x, y, z, -dx, -dy, -dz, 0);
	}

	// Still inside the cube, so keep going
	return scoreRow(x_temp, y_temp, z_temp, dx, dy, dz);
}

function scoreLine(a, b, c, dx, dy, dz, count) {
	// redrawScreen(a,b,c);
	var counter = count + 1;
	if (Plane[a][b][c] == playerTurn) {
		countYours++;
	}
	if (Plane[a][b][c] == oPlayerTurn) {
		countOpponents++;
	}
	a += dx;
	b += dy;
	c += dz;
	if (counter == 4) {
		if (countYours == 3 || countOpponents == 3) {
			// alert("Someone has to win!");
			return 100;
		}
		if (countYours == 2 && countOpponents == 0) {
			countTwoYours++;
		}
		if (countOpponents == 2 && countYours == 0) {
			countTwoOpponents++;
		}
		if (countYours == 0 && countOpponents == 0) {
			return 1;
		}
		if (countYours > 0 && countOpponents > 0) {
			return 0;
		}
		return 1 + (countYours * aggression) + (countOpponents * defence);
	}
	if (a < 0 || a > 3 || b < 0 || b > 3 || c < 0 || c > 3) {
		// alert("Outside of Cube!");
		return 0;
	}
	return scoreLine(a, b, c, dx, dy, dz, counter);
}

function redrawScreen(a, b, c) {
	var location = a + (b * 4) + (c * 16);
	document.images[location].src = Winner.src;
	var value = Plane[a][b][c];
	alert("Press");
	document.images[location].src = Player[value].src;
}

function makeMove(x, y, z, isHuman) {
	// alert("DECL:makeMove(x,y,z) (" + x + y + z +")" + isHuman);
	if (gameOver) {
		alert("Game Over! Winner was player " + playerTurn);
		return;
	}
	if (gameState == false) {
		// Some message to the window to say press start first I think
		return;
	}
	if (Computer[playerTurn] && isHuman) {
		// Some message to the window to say press start first I think
		return;
	}

	if (Plane[x][y][z] != 0) {
		alert("Player " + Plane[x][y][z] + " has already gone there!");
		return;
	}

	Plane[x][y][z] = playerTurn;

	var location = x + (y * 4) + (z * 16);

	document.images[location].src = Player[playerTurn].src;

	// Need to check to see if the player has won
	if (checkIfWon(x, y, z)) {
		playersturn.innerHTML = "Winner!";
		if (Computer[playerTurn] == true) {
			alert("Computer player " + playerTurn + " has 4 in a row and wins!");
		} else {
			alert("Player " + playerTurn + " has 4 in a row and wins!");
		}

		gameOver = true;
		return;
	}

	nextTurn();

}

function checkIfWon(x, y, z) {

	// alert("DECL:checkIfWon(x,y,z)");

	// Check the 8 possible rows intersecting the place you just went
	if (checkRow(x, y, z, 1, 0, 0) || checkRow(x, y, z, 0, 1, 0)
			|| checkRow(x, y, z, 0, 0, 1) || checkRow(x, y, z, 1, 1, 0)
			|| checkRow(x, y, z, 1, -1, 0) || checkRow(x, y, z, 0, 1, 1)
			|| checkRow(x, y, z, 0, 1, -1) || checkRow(x, y, z, 1, 0, 1)
			|| checkRow(x, y, z, 1, 0, -1) || checkRow(x, y, z, 1, 1, 1)
			|| checkRow(x, y, z, 1, -1, 1) || checkRow(x, y, z, -1, 1, 1)
			|| checkRow(x, y, z, 1, 1, -1)) {
		return true;

	}

	return false;
}

function checkRow(x, y, z, dx, dy, dz) {

	// First add direction until come to point outside the cube
	x_temp = x + dx;
	y_temp = y + dy;
	z_temp = z + dz;

	// Then reserve the direction and do a checkLine() from there
	if (x_temp < 0 || x_temp > 3 || y_temp < 0 || y_temp > 3 || z_temp < 0
			|| z_temp > 3) {
		return checkLine(x, y, z, -dx, -dy, -dz, 0);
	}

	// Still inside the cube, so keep going
	return checkRow(x_temp, y_temp, z_temp, dx, dy, dz);
}

function checkLine(a, b, c, dx, dy, dz, count) {
	if (Plane[a][b][c] != playerTurn) {
		return false;
	}
	var counter = count + 1;
	// alert(counter);
	a += dx;
	b += dy;
	c += dz;
	if (counter == 4) {
		showWinningLine(a, b, c, dx, dy, dz, 0);
		return true;
	}
	if (a < 0 || a > 3 || b < 0 || b > 3 || c < 0 || c > 3) {
		return false;
	}
	return checkLine(a, b, c, dx, dy, dz, counter);
}

function showWinningLine(a, b, c, dx, dy, dz, count) {
	var counter = count + 1;
	a = (a + dx) % 4;
	if (a < 0) {
		a += 4;
	}
	b = (b + dy) % 4;
	if (b < 0) {
		b += 4;
	}
	c = (c + dz) % 4;
	if (c < 0) {
		c += 4;
	}
	var location = a + (b * 4) + (c * 16);
	document.images[location].src = Winner.src;
	if (counter == 4) {
		return true;
	}
	return showWinningLine(a, b, c, dx, dy, dz, counter);
}

function nextTurn() {
	// alert('DECL:nextTurn()');
	if (level > 2 && gameTurn == 1 && Computer[playerTurn]) {
		aggression = 2;
	}
	if (level > 2 && gameTurn == 2 && Computer[playerTurn]) {
		defence = 2;
	}
	if (gameOver == true) {
		return;
	}

	// Increase game turn
	gameTurn++;

	// Change over to other player
	oPlayerTurn = playerTurn;
	playerTurn = (playerTurn % 2) + 1;

	// Update player turn image
	TurnIcon.src = Player[playerTurn].src;

	// Check to see if draw game (after 64 goes)
	if (gameTurn > 64) {
		playersturn.innerHTML = "Draw!";
		alert("Game is a draw!");
		gameOver = true;
		return;
	}

	// Check to see if it is a computers turn
	if (Computer[playerTurn]) {
		setTimeout("selectBestMove();", 50);
	}
}

function showAI() {
	ai.style.display = "block";
}

function hideAI() {
	ai.style.display = "none";
}

function startGame() {
	// alert("DECL:startGame()");
	playerTurn = Math.floor(2 * Math.random()) + 1;
	playerTurnWindow.style.display = "block";
	startstop.innerHTML = "Reset";

	if (window.document.setgame.players[0].checked == true) {
		Computer[1] = true;
		Computer[2] = true;
	}
	if (window.document.setgame.players[1].checked == true) {
		Computer[2] = true;
	}
	level = setgame.difficulty.selectedIndex;
	aggression = 1;
	defence = 1;
	gameState = true;
	gameOver = false;
	gameTurn = 0;
	nextTurn();
}

function resetGame() {
	gameState = false;
	playersturn.innerHTML = "Player's Turn";
	playerTurnWindow.style.display = "none";
	startstop.innerHTML = "Start";

	var myCounter = 0;
	for ( var i = 0; i < Plane.length; i++) {
		Plane[i] = new Array(4);
		for ( var j = 0; j < Plane[i].length; j++) {
			Plane[i][j] = new Array(4);
			for ( var k = 0; k < Plane[i][j].length; k++) {
				Plane[i][j][k] = 0;
				document.images[myCounter++].src = Player[0].src;
			}
		}
	}
	Computer[1] = false;
	Computer[2] = false;
}

function toggleGame() {
	if (gameState == false) {
		startGame();
	} else {
		resetGame();
	}
}