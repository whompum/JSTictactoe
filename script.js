var originalBoard; //Array DS to house the cells
const humanPiece = 'O';
const AIPiece = 'X';

//Array containingthe winnig combinations for the game
const winningCombinations = [
  [0,1,2],  //First row
  [3,4,5],  //Second row
  [6,7,8],  //Third row

  [0,3,6],  //First vertical
  [1,4,7],  //Second vertical
  [2,5,8],  //Third vertical

  [0,4,8],  //Diagonal (Left2Right)
  [6,4,2]  //Diagonal (Right2Left)
];

start(); // NOT WORKING? por que

document.getElementById("replay").addEventListener("click", start);

function start(){
  console.log("Starting the game...")
  toggleItem('.endgame');

  originalBoard = new Array(9);
  populateBoard(originalBoard);
  resetCellsUi();
}


function resetCellsUi(){
const cells = document.querySelectorAll('.cell');

  for(var celly = 0; celly < cells.length; celly++){
      let gamePiece = cells[celly];
          gamePiece.innerText = ' ';
          gamePiece.style.removeProperty('background-color');
          gamePiece.addEventListener('click', onCellClicked, false);
  }
}


//Sets the piece to the board, then checks if the game is won-tied
//Then allows the AI a turn to play their piece
function setPiece(index, playerPiece){

  if(!flipPiece(index, playerPiece))
    if(!checkTie(openCellIndex(originalBoard)))
      flipPiece(minimaxBestSpot(), AIPiece);
    else
      gameTied();

}

/*
Returns all the cells where their value is of type number
If values are of type numbers, then a piece hasn't been set yet.
*/
function openCellIndex(board){
  return board.filter(s => typeof s == "number");
}

//Sets the piece, then checks for game win / loss / tied / etc
function flipPiece(index, playerPiece){
  originalBoard[index] = playerPiece
  setPieceUi(document.getElementById(index), playerPiece);

  let gameWon = checkWin(originalBoard, playerPiece);

  if(gameWon) //If gameWon  !== null
    gameOver(gameWon);

    return gameWon;
}

//Checks if the player has won
/*
Checks if the player has won.
How it does this is it takes the last set piece then
combs through the array and concats to a new array, all values
equal to the last player to set their piece. If the new array matches
any of the winning array combinations, then a won has happened.

HOW REDUCE WORKS HERE:

Basically we take an accumulator and initialize it with an empty array.
Then we comb through the newly changed board and find all elements that the
last player has their piece at. When we find a like element (board[a] === player)
we store that in the accumulator (remember it was initialized with an empty array)

Then we comb through each sub-array of the winning combinations

*/

function checkWin(board, player){
  let check = board.reduce( (accumulator, element, index) => (element === player) ? accumulator.concat(index) : accumulator, []);

  for(let [i, v] of winningCombinations.entries())
      if(v.every(e => check.indexOf(e) > -1))
         return {index: i, winner: player};

  return null
}


function checkTie(board){
  return (board.length == 0);
}

function declareWinner(winner){
  //document.querySelector(".endgame").style.display = "block";
 //document.querySelector(".endgame.text").innerText = who;
  console.log(winner);
}



//Called when the game is over (Will change the cells to a different color, and block all user input)
function gameOver(gameWon){
  removeCellEventListener();
  highlightWin(gameWon);
  declareWinner( (gameWon.winner == humanPiece) ? "YOU WIN!" : "YOU LOSE!" );
  console.log("The winning piece is: " + gameWon.winner);
}

function gameTied(){
  removeCellEventListener();
  declareWinner("Tie Game!");
}

function removeCellEventListener(){
  for(let celly of document.querySelectorAll('.cell'))
      celly.removeEventListener("click", onCellClicked, false);
}

//Iterates over the cells then changes their backgroundColor based on the player, and then changes the text color to white;
function highlightWin(gameWon){

  const clr = (gameWon.winner == humanPiece) ? "green" : "red";

  for(winningIndex of winningCombinations[gameWon.index]){
      const cell = document.getElementById(winningIndex)
      cell.style.backgroundColor = clr;
      cell.style.color = "white";
    }

}

function minimaxBestSpot(){
  var index = minimax(originalBoard, AIPiece); //Returns a object containing the best result via its index;

  return index.index;
}


function minimax(newBoard, player){
  //available spots
  var availSpots = openCellIndex(newBoard);

  // checks for the terminal states such as win, lose, and tie and returning a value accordingly
  if (checkWin(newBoard, humanPiece)){
     return {score:-10};
  }
	else if (checkWin(newBoard, AIPiece)){
    return {score:10};
	}
  else if (availSpots.length === 0){
  	return {score:0};
  }

// an array to collect all the objects
  var moves = [];

  // loop through available spots
  for (var i = 0; i < availSpots.length; i++){
    //create an object for each and store the index of that spot that was stored as a number in the object's index key
    var move = {};
  	move.index = newBoard[availSpots[i]];

    // set the empty spot to the current player
    newBoard[availSpots[i]] = player;

    //if collect the score resulted from calling minimax on the opponent of the current player
    if (player == AIPiece){
      var result = minimax(newBoard, humanPiece);
      move.score = result.score;
    }
    else{
      var result = minimax(newBoard, AIPiece);
      move.score = result.score;
    }

    //reset the spot to empty
    newBoard[availSpots[i]] = move.index;

    // push the object to the array
    moves.push(move);
  }

// if it is the computer's turn loop over the moves and choose the move with the highest score
  var bestMove;
  if(player === AIPiece){
    var bestScore = -10000;
    for(var i = 0; i < moves.length; i++){
      if(moves[i].score > bestScore){
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  }else{

// else loop over the moves and choose the move with the lowest score
    var bestScore = 10000;
    for(var i = 0; i < moves.length; i++){
      if(moves[i].score < bestScore){
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  }

// return the chosen move (object) from the array to the higher depth
  return moves[bestMove];
}



//Called when a cell is clicked (By a human player)
function onCellClicked(cell){
  const index = cell.target.id;
  if( (typeof originalBoard[index] == "number") )
    setPiece(index, humanPiece)
}

//Sets the piece via the UI
function setPieceUi(item, playerPiece){
  item.innerText = playerPiece
}

//Populates a tic tac toe board with values 0-9 inclusive
function populateBoard(board){
  for(i = 0; i < board.length; i++)
    board[i] = i;
}

//Prints indecies of the board
function printBoard(board){
  console.log(board)
}

//Helper method to hide the modal after a new game
function toggleItem(docItem){
  document.querySelector(docItem).style.display = "none";
}
