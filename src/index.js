import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const winningLines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

function Square(props) {
    return (
        <button className={props.displayStateClass} onClick={props.onClick}>
            {props.value}
        </button>
    );
}

function calculateWinner(boardState) {
    for (let line = 0; line < winningLines.length; line++) {
        const [a, b, c] = winningLines[line];
        if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
            return line + 1;
        }
    }
    return null;
}

class Board extends React.Component {
    renderSquare(squareIndex) {
        const winner = calculateWinner(this.props.boardState);
        var displayStateClass = "square";
        if (winner) {
            const [a, b, c] = winningLines[winner - 1];
            if (squareIndex === a || squareIndex === b || squareIndex === c) {
                displayStateClass = "square-highlight";
            }
        }
        return (
            <Square
                key={squareIndex}
                value={this.props.boardState[squareIndex]}
                onClick={() => this.props.onClick(squareIndex)}
                displayStateClass={displayStateClass}
            />
        );
    }

    render() {
        const boardRowNumbers = [0, 1, 2];
        const boardColNumbers = [0, 1, 2];
        var boardRows = boardRowNumbers.map((row) => {
            return <div className="board-row" key={row}>{
                boardColNumbers.map((col) => {
                    return this.renderSquare(row * boardRowNumbers.length + col);
                })}
            </div>;
        });
        //  this is what i wanted to do, array[] of tags/dom objects not handled this way (like string) apparently
        // var boardRows = [];
        // for (let row = 0; row < 3; ++row) {
        //     boardRows.push(<div className="board-row">);
        //     for (let col = 0; col < 3; ++col {
        //         boardRows.push(this.renderSquare(row * boardRowNumbers.length + col));
        //     }
        //     boardRows.push(</div>);
        // }
        return <div>{boardRows}</div>;
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.initialState();
    }

    initialState() {
        return {
            gameStatusHistory: [
                {
                    boardState: Array(9).fill(null),
                    choice: -1,
                }
            ],
            stepNumber: 0,
            turn: true,
            ascendingHistory: true
        };
    }

    jumpToState(move) {
        return {
            gameStatusHistory: this.state.gameStatusHistory.slice(0, move + 1),
            stepNumber: move,
            turn: (move % 2) === 0
        };
    }

    handleClick(squareIndex) {
        const gameStatusHistory = this.state.gameStatusHistory.slice();
        var boardState = gameStatusHistory[gameStatusHistory.length - 1].boardState.slice();;
        if (calculateWinner(boardState) || boardState[squareIndex]) {
            return;
        }
        boardState[squareIndex] = this.getTurnDisplay(this.state.turn);
        this.setState({
            gameStatusHistory: gameStatusHistory.concat([
                {
                    boardState: boardState,
                    choice: squareIndex,
                    turn: this.state.turn
                }
            ]),
            stepNumber: gameStatusHistory.length,
            turn: !this.state.turn
        });
    }

    getTurnDisplay(turn) {
        return (turn ? "X" : "O");
    }

    getAscendingDisplay() {
        return (this.state.ascendingHistory ? "Sort up" : "Sort down");
    }

    render() {
        const gameStatusHistory = this.state.gameStatusHistory.slice();
        const gameStatus = gameStatusHistory[this.state.stepNumber];

        const newgame = <button onClick={() => this.setState(this.initialState())}>New Game</button>;
        const ascending= <button onClick={() => this.setState({ascendingHistory: !this.state.ascendingHistory})}>{this.getAscendingDisplay()}</button>;

        const winner = calculateWinner(gameStatus.boardState);
        let status;
        if (winner) {
            status = "Winner: " + this.getTurnDisplay(gameStatus.turn);
        } else if (this.state.stepNumber < 9) {
            status = "Next player: " + this.getTurnDisplay(this.state.turn);
        } else {
            status = "Cat's game";
        }

        if (!this.state.ascendingHistory) {
            gameStatusHistory.reverse();
        }
        const moves = gameStatusHistory.map((gameStatus, move) => {
            var moveIndex = this.state.ascendingHistory ?
                move :
                gameStatusHistory.length - 1 - move;
            var description = moveIndex ?
                this.getTurnDisplay(gameStatus.turn) + ' [' + (gameStatus.choice % 3) + ', ' + Math.floor(gameStatus.choice / 3) + ']' :
                'Start';
            if (moveIndex === gameStatusHistory.length - 1) {
                description = <b>{description}</b>
            }
            return (
                <li key={moveIndex}>
                    <button onClick={() => this.setState(this.jumpToState(moveIndex))}>{description}</button>
                </li>
            );
        });

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        boardState={gameStatus.boardState}
                        onClick={i => this.handleClick(i)}
                    />
                </div>
                <div className="game-info">
                    <div>{newgame}</div>
                    <div>{ascending}</div>
                    <div>{status}</div>
                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));
