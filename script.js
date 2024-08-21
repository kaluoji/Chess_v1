const board = document.getElementById('chess-board');
const whiteTimer = document.getElementById('white-timer');
const blackTimer = document.getElementById('black-timer');
let selectedPiece = null;
let currentPlayer = 'white';
let whiteTime = 300; // 5 minutes in seconds
let blackTime = 300;
let timerInterval;

const initialBoard = [
    ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
    ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
    ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']
];

function createBoard() {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.classList.add('square', (row + col) % 2 === 0 ? 'white' : 'black');
            square.dataset.row = row;
            square.dataset.col = col;
            square.textContent = initialBoard[row][col];
            square.addEventListener('click', handleSquareClick);
            board.appendChild(square);
        }
    }
}

function handleSquareClick(event) {
    const clickedSquare = event.target;
    const row = parseInt(clickedSquare.dataset.row);
    const col = parseInt(clickedSquare.dataset.col);

    if (selectedPiece) {
        const startRow = parseInt(selectedPiece.dataset.row);
        const startCol = parseInt(selectedPiece.dataset.col);

        if (isValidMove(startRow, startCol, row, col)) {
            movePiece(selectedPiece, clickedSquare);
            switchPlayer();
        }

        clearHighlights();
        selectedPiece = null;
    } else if (clickedSquare.textContent && isPieceOfCurrentPlayer(clickedSquare.textContent)) {
        selectedPiece = clickedSquare;
        highlightValidMoves(row, col);
    }
}

function isPieceOfCurrentPlayer(piece) {
    return (currentPlayer === 'white' && piece.charCodeAt(0) >= 9812 && piece.charCodeAt(0) <= 9817) ||
           (currentPlayer === 'black' && piece.charCodeAt(0) >= 9818 && piece.charCodeAt(0) <= 9823);
}

function isValidMove(startRow, startCol, endRow, endCol) {
    const piece = board.children[startRow * 8 + startCol].textContent;
    const targetPiece = board.children[endRow * 8 + endCol].textContent;

    if (targetPiece && isPieceOfCurrentPlayer(targetPiece)) {
        return false;
    }

    switch (piece.toLowerCase()) {
        case '♙':
        case '♟':
            return isValidPawnMove(startRow, startCol, endRow, endCol);
        case '♖':
        case '♜':
            return isValidRookMove(startRow, startCol, endRow, endCol);
        case '♘':
        case '♞':
            return isValidKnightMove(startRow, startCol, endRow, endCol);
        case '♗':
        case '♝':
            return isValidBishopMove(startRow, startCol, endRow, endCol);
        case '♕':
        case '♛':
            return isValidQueenMove(startRow, startCol, endRow, endCol);
        case '♔':
        case '♚':
            return isValidKingMove(startRow, startCol, endRow, endCol);
        default:
            return false;
    }
}

function isValidPawnMove(startRow, startCol, endRow, endCol) {
    const direction = currentPlayer === 'white' ? -1 : 1;
    const startingRow = currentPlayer === 'white' ? 6 : 1;

    if (startCol === endCol && board.children[endRow * 8 + endCol].textContent === '') {
        if (endRow === startRow + direction) {
            return true;
        }
        if (startRow === startingRow && endRow === startRow + 2 * direction && board.children[(startRow + direction) * 8 + startCol].textContent === '') {
            return true;
        }
    }

    if (Math.abs(startCol - endCol) === 1 && endRow === startRow + direction) {
        const targetPiece = board.children[endRow * 8 + endCol].textContent;
        return targetPiece !== '' && !isPieceOfCurrentPlayer(targetPiece);
    }

    return false;
}

function isValidRookMove(startRow, startCol, endRow, endCol) {
    if (startRow !== endRow && startCol !== endCol) {
        return false;
    }

    const rowStep = startRow === endRow ? 0 : (endRow - startRow) / Math.abs(endRow - startRow);
    const colStep = startCol === endCol ? 0 : (endCol - startCol) / Math.abs(endCol - startCol);

    for (let i = 1; i < Math.max(Math.abs(endRow - startRow), Math.abs(endCol - startCol)); i++) {
        if (board.children[(startRow + i * rowStep) * 8 + (startCol + i * colStep)].textContent !== '') {
            return false;
        }
    }

    return true;
}

function isValidKnightMove(startRow, startCol, endRow, endCol) {
    const rowDiff = Math.abs(endRow - startRow);
    const colDiff = Math.abs(endCol - startCol);
    return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
}

function isValidBishopMove(startRow, startCol, endRow, endCol) {
    if (Math.abs(endRow - startRow) !== Math.abs(endCol - startCol)) {
        return false;
    }

    const rowStep = (endRow - startRow) / Math.abs(endRow - startRow);
    const colStep = (endCol - startCol) / Math.abs(endCol - startCol);

    for (let i = 1; i < Math.abs(endRow - startRow); i++) {
        if (board.children[(startRow + i * rowStep) * 8 + (startCol + i * colStep)].textContent !== '') {
            return false;
        }
    }

    return true;
}

function isValidQueenMove(startRow, startCol, endRow, endCol) {
    return isValidRookMove(startRow, startCol, endRow, endCol) || isValidBishopMove(startRow, startCol, endRow, endCol);
}

function isValidKingMove(startRow, startCol, endRow, endCol) {
    const rowDiff = Math.abs(endRow - startRow
