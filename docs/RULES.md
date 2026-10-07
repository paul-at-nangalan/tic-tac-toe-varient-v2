# Tic-Tac-Toe Corner Master - Game Rules & Algorithms

## Game Rules

1. **Players & Board**:
   - Played on a 3x3 grid.
   - Player 1 plays as **X**, Player 2 plays as **O**.
   - Players take turns placing one piece at a time on any empty board cell.

2. **Winning Condition**:
   - To win instantly, a player must occupy **3 out of the 4 corners** of the 3x3 board (`(0,0)`, `(0,2)`, `(2,0)`, `(2,2)`).
   - Forming a line of 3 does **NOT** instantly win the game.

3. **Line of 3 & Piece Removal**:
   - Standard Tic-Tac-Toe lines apply: 3 horizontal rows, 3 vertical columns, and 2 diagonals.
   - When a player forms a line of 3 with their turn:
     - If the opponent has any pieces on the board, the player enters **Removal Mode**.
     - The active player selects and removes **1** opponent piece of their choice from the board.
     - Even if multiple lines of 3 are formed simultaneously by a single placement, only 1 opponent piece is removed.
     - If the opponent has no pieces on the board, the removal phase is automatically skipped.
     - Once the removal action is complete (or skipped), the turn passes to the next player.
   - Lines of 3 can be formed again later in the match as board configurations change.

4. **Tiebreaker (Board Full)**:
   - If the board becomes completely full and no player has achieved 3 corners:
     - The winner is determined by comparing the total cumulative score:
       `Score = (Total Corners Held Throughout Game) + (Total Lines of 3 Formed Throughout Game)`
     - Even if corners or lines were previously disrupted by piece removal, every corner occupied and line of 3 formed over the course of the match counts toward this total.
     - If both scores are equal, the game ends in a Draw.

---

## Detection Algorithms

The board is represented internally by a 3x3 2D array / matrix (`board[row][col]`):
- `null` = Empty
- `'X'` = Player 1
- `'O'` = Player 2

### 1. Corner Occupation Check
The four corners of the 3x3 matrix correspond to indices:
- Top-Left: `[0][0]`
- Top-Right: `[0][2]`
- Bottom-Left: `[2][0]`
- Bottom-Right: `[2][2]`

To check if a player `P` has won via corners:
```javascript
function hasThreeCorners(board, player) {
  const corners = [
    board[0][0],
    board[0][2],
    board[2][0],
    board[2][2]
  ];
  const count = corners.filter(cell => cell === player).length;
  return count >= 3;
}
```

### 2. Line of 3 Detection
There are 8 possible winning lines on a 3x3 grid:
- **3 Rows**: `[r][0], [r][1], [r][2]` for `r` in `[0, 1, 2]`
- **3 Columns**: `[0][c], [1][c], [2][c]` for `c` in `[0, 1, 2]`
- **Main Diagonal**: `[0][0], [1][1], [2][2]`
- **Anti Diagonal**: `[0][2], [1][1], [2][0]`

To check if a placed move forms at least one line of 3 for player `P`:
```javascript
function checkLinesOfThree(board, player) {
  const lines = [
    // Rows
    [[0,0], [0,1], [0,2]],
    [[1,0], [1,1], [1,2]],
    [[2,0], [2,1], [2,2]],
    // Columns
    [[0,0], [1,0], [2,0]],
    [[0,1], [1,1], [2,1]],
    [[0,2], [1,2], [2,2]],
    // Diagonals
    [[0,0], [1,1], [2,2]],
    [[0,2], [1,1], [2,0]]
  ];

  return lines.filter(line =>
    line.every(([r, c]) => board[r][c] === player)
  );
}
```
If `checkLinesOfThree(board, player).length > 0`, the player formed a line of 3 on that move.
