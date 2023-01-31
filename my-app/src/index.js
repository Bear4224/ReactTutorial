import { isLabelWithInternallyDisabledControl } from '@testing-library/user-event/dist/utils';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

function Square(props) {
  //Each Square receives data from Board and is set to activate
  //the onClick method, which is linked to handleClick in Game
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  //Renders the board, taking data from Game and passing
  //it down to each Square.
  renderSquare(i) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    return (
      <div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
  }
}

class Game extends React.Component {
  //Top level data structure, contains and distributes the State
  //data
  constructor(props) {
    super(props);
    this.state = {
      history: [
        //an array of arrays of Square objects-
        //a way to store boards in sequential order.
        //For now, empty
        {
          squares: Array(9).fill(null)
        }
      ],
      //A way of indexing which turn we're on, as well
      //as indexing which board corresponds with which turn
      stepNumber: 0,
      //Keeps track of whose turn it is. Starts with X going
      //first
      xIsNext: true
    };
  }

  handleClick(i) {
    //called by onClick, as determined by the props passed to 
    //Board
    
    //creates a copy of the current record of boards to modify
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    //creates a copy of the current board to modify it, so as not
    //to modify the historical copy
    const current = history[history.length - 1];
    //copy Square states to check without modifying actual data
    const squares = current.squares.slice();
    //No winner or the attempted Square already has a value...
    if (calculateWinner(squares) || squares[i]) {
      //...do nothing, no State change. Denies them the move
      return;
    }
    //With that cleared up, move on, and update selected Square
    //to have the value of the current player
    squares[i] = this.state.xIsNext ? "X" : "O";
    //Append the board to become the latest entry in
    //the historical record
    this.setState({
      history: history.concat([
        {
          squares: squares
        }
      ]),
      //update turn number and whose turn it is so gameplay
      //can continue
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext
    });
  }

  //method called by onClick on the revert buttons, this sets
  //the state to what it was on that turn
  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);
    //Creates a new array based on History-
    //Each index is replaced with a button that refers to the
    //squares array it replaces to fill out what move it is
    //Step = what 

    //For each board in history, display a button with a key
    //equal to the highest number of filled out squares
    
    //Step is for each each board object, move is its index and has
    //absolutely nothing to do with its contents
    const moves = history.map((step, move) => {
      const desc = move ?
        'Go to move #' + move :
        'Go to game start';
      return (
        //list of buttons, each labeled according to the move num
        //it's tied to. That number gets used in the desc and
        //jumpTo 
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });

    //Update the status text to reflect who's won or taking
    //their turn, to be displayed in the return statement
    let status;
    console.log(this.state.stepNumber)
    if (winner) {
      status = "Winner: " + winner;
    }
    else if (this.state.stepNumber == 9){
      status = "Tie!"
    }
    else {
      status = "Next player: " + (this.state.xIsNext ? "X" : "O");
    }

    //Notable: ol is an ordered list, used to display a number
    //beside each revert button corresponding to the turn it
    //represents
    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={i => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);

//Helper function to check all possible win states. If there's
//a set of squares in the possible winbook that all have the
//same value, it returns the value of one of those squares as
//the identity of the winner. 
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}
