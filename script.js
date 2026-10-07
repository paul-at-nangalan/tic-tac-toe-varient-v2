/**
 * Corner Master Tic-Tac-Toe Game Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // Game State Constants
  const PLAYER_1 = 'X';
  const PLAYER_2 = 'O';

  const CORNER_COORDS = [
    [0, 0], [0, 2],
    [2, 0], [2, 2]
  ];

  const LINES = [
    // Rows
    [[0, 0], [0, 1], [0, 2]],
    [[1, 0], [1, 1], [1, 2]],
    [[2, 0], [2, 1], [2, 2]],
    // Columns
    [[0, 0], [1, 0], [2, 0]],
    [[0, 1], [1, 1], [2, 1]],
    [[0, 2], [1, 2], [2, 2]],
    // Diagonals
    [[0, 0], [1, 1], [2, 2]],
    [[0, 2], [1, 1], [2, 0]]
  ];

  // Game State Variables
  let board = [
    [null, null, null],
    [null, null, null],
    [null, null, null]
  ];

  let currentPlayer = PLAYER_1;
  let isRemovalMode = false;
  let isGameOver = false;

  // Cumulative Stats for Tiebreaker
  let stats = {
    [PLAYER_1]: { corners: 0, lines: 0 },
    [PLAYER_2]: { corners: 0, lines: 0 }
  };

  // DOM Elements
  const boardElem = document.getElementById('board');
  const cells = document.querySelectorAll('.cell');
  const turnIndicator = document.getElementById('turn-indicator');
  const gameMessage = document.getElementById('game-message');
  const resetBtn = document.getElementById('reset-btn');

  const p1CornersElem = document.getElementById('p1-corners');
  const p1LinesElem = document.getElementById('p1-lines');
  const p2CornersElem = document.getElementById('p2-corners');
  const p2LinesElem = document.getElementById('p2-lines');

  const modalOverlay = document.getElementById('modal-overlay');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalRestartBtn = document.getElementById('modal-restart-btn');

  // Helper Functions
  function getOpponent(player) {
    return player === PLAYER_1 ? PLAYER_2 : PLAYER_1;
  }

  function getPlayerName(player) {
    return player === PLAYER_1 ? 'Player 1 (X)' : 'Player 2 (O)';
  }

  // Algorithm 1: Corner Occupation Check
  function getCornersOccupied(player) {
    return CORNER_COORDS.filter(([r, c]) => board[r][c] === player).length;
  }

  function checkThreeCornersWin(player) {
    return getCornersOccupied(player) >= 3;
  }

  // Algorithm 2: Line of 3 Detection for Newly Placed Move
  function checkLinesOfThreeForMove(player, row, col) {
    return LINES.filter(line =>
      line.some(([r, c]) => r === row && c === col) &&
      line.every(([r, c]) => board[r][c] === player)
    );
  }

  function hasOpponentPieces(player) {
    const opponent = getOpponent(player);
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (board[r][c] === opponent) return true;
      }
    }
    return false;
  }

  function isBoardFull() {
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (board[r][c] === null) return false;
      }
    }
    return true;
  }

  function updateStatsDisplay() {
    p1CornersElem.textContent = stats[PLAYER_1].corners;
    p1LinesElem.textContent = stats[PLAYER_1].lines;
    p2CornersElem.textContent = stats[PLAYER_2].corners;
    p2LinesElem.textContent = stats[PLAYER_2].lines;
  }

  function updateScoreStatsOnPlacement(player, row, col, linesFormed) {
    // Check if placed piece is on a corner
    const isCorner = CORNER_COORDS.some(([cr, cc]) => cr === row && cc === col);
    if (isCorner) {
      stats[player].corners += 1;
    }

    // Add count of new lines formed by this specific move
    if (linesFormed.length > 0) {
      stats[player].lines += linesFormed.length;
    }

    updateStatsDisplay();
  }

  function updateUI() {
    // Render Board State
    cells.forEach(cell => {
      const r = parseInt(cell.dataset.row, 10);
      const c = parseInt(cell.dataset.col, 10);
      const val = board[r][c];

      cell.textContent = val ? val : '';
      cell.classList.remove('x', 'o', 'removable');

      if (val === PLAYER_1) {
        cell.classList.add('x');
      } else if (val === PLAYER_2) {
        cell.classList.add('o');
      }

      // Configure cell interaction states
      if (isGameOver) {
        cell.disabled = true;
      } else if (isRemovalMode) {
        const opponent = getOpponent(currentPlayer);
        if (val === opponent) {
          cell.disabled = false;
          cell.classList.add('removable');
        } else {
          cell.disabled = true;
        }
      } else {
        // Placement Mode
        cell.disabled = val !== null;
      }
    });

    // Update Board removal mode class
    if (isRemovalMode) {
      boardElem.classList.add('removal-mode');
    } else {
      boardElem.classList.remove('removal-mode');
    }

    // Status Panel Texts
    turnIndicator.textContent = `${getPlayerName(currentPlayer)}'s Turn`;
    turnIndicator.className = 'current-turn' + (currentPlayer === PLAYER_2 ? ' p2' : '');

    if (isRemovalMode) {
      gameMessage.textContent = `${getPlayerName(currentPlayer)} formed a line of 3! Click an opponent's piece to remove it.`;
      gameMessage.classList.add('removal-mode');
    } else {
      gameMessage.textContent = 'Select an empty cell to place your piece.';
      gameMessage.classList.remove('removal-mode');
    }
  }

  function handleCellClick(e) {
    if (isGameOver) return;

    const cell = e.target;
    const r = parseInt(cell.dataset.row, 10);
    const c = parseInt(cell.dataset.col, 10);

    if (isRemovalMode) {
      const opponent = getOpponent(currentPlayer);
      if (board[r][c] === opponent) {
        // Remove opponent piece
        board[r][c] = null;
        isRemovalMode = false;

        // Check if removal triggered win or tiebreaker
        if (checkThreeCornersWin(currentPlayer)) {
          triggerGameOver(currentPlayer, 'corners');
          return;
        }

        // Switch Turn
        currentPlayer = getOpponent(currentPlayer);
        updateUI();
      }
    } else {
      // Normal Placement
      if (board[r][c] !== null) return;

      board[r][c] = currentPlayer;

      // Detect lines formed specifically by this placed move
      const linesFormed = checkLinesOfThreeForMove(currentPlayer, r, c);

      // Update Cumulative Statistics
      updateScoreStatsOnPlacement(currentPlayer, r, c, linesFormed);

      // 1. Check for 3 Corners Instant Win
      if (checkThreeCornersWin(currentPlayer)) {
        updateUI();
        triggerGameOver(currentPlayer, 'corners');
        return;
      }

      // 2. Check for Line of 3 (Removal Mode Trigger)
      const opponentHasPieces = hasOpponentPieces(currentPlayer);

      if (linesFormed.length > 0 && opponentHasPieces) {
        isRemovalMode = true;
        updateUI();
        return;
      }

      // 3. Check for Full Board (Tiebreaker)
      if (isBoardFull()) {
        updateUI();
        triggerTiebreaker();
        return;
      }

      // Switch turn if no removal mode triggered
      currentPlayer = getOpponent(currentPlayer);
      updateUI();
    }
  }

  function triggerGameOver(winner, reason) {
    isGameOver = true;
    modalTitle.textContent = `${getPlayerName(winner)} Wins!`;
    if (reason === 'corners') {
      modalBody.textContent = `Congratulations! ${getPlayerName(winner)} occupied 3 corners of the board!`;
    } else {
      modalBody.textContent = `${getPlayerName(winner)} won the match!`;
    }
    modalOverlay.classList.add('active');
  }

  function triggerTiebreaker() {
    isGameOver = true;
    const p1Score = stats[PLAYER_1].corners + stats[PLAYER_1].lines;
    const p2Score = stats[PLAYER_2].corners + stats[PLAYER_2].lines;

    modalTitle.textContent = 'Board Full - Tiebreaker!';

    if (p1Score > p2Score) {
      modalBody.textContent = `Player 1 (X) wins on tiebreaker score (${p1Score} vs ${p2Score})!`;
    } else if (p2Score > p1Score) {
      modalBody.textContent = `Player 2 (O) wins on tiebreaker score (${p2Score} vs ${p1Score})!`;
    } else {
      modalBody.textContent = `It's a complete Draw! Both players tied with ${p1Score} points.`;
    }

    modalOverlay.classList.add('active');
  }

  function initGame() {
    board = [
      [null, null, null],
      [null, null, null],
      [null, null, null]
    ];
    currentPlayer = PLAYER_1;
    isRemovalMode = false;
    isGameOver = false;

    stats = {
      [PLAYER_1]: { corners: 0, lines: 0 },
      [PLAYER_2]: { corners: 0, lines: 0 }
    };

    updateStatsDisplay();
    modalOverlay.classList.remove('active');
    updateUI();
  }

  // Event Listeners
  cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
  });

  resetBtn.addEventListener('click', initGame);
  modalRestartBtn.addEventListener('click', initGame);

  // Initialize
  initGame();
});
