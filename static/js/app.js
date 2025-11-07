// app.js
document.addEventListener("DOMContentLoaded", () => {
  // screens
  const modeScreen = document.getElementById("modeScreen");
  const sizeScreen = document.getElementById("sizeScreen");
  const gameScreen = document.getElementById("gameScreen");

  const statusEl = document.getElementById("status");
  const boardEl = document.getElementById("board");
  const restartAppBtn = document.getElementById("restartAppBtn");
  const playAgainBtn = document.getElementById("playAgainBtn");
  const firstIsXCheckbox = document.getElementById("firstIsX");

  let mode = "two,single"; // "single" or "two"
  let size = 3;
  let winLength = 3; // will be set based on size
  let board = []; // flat array
  let currentPlayer = "X";
  let gameOver = false;
  let aiSymbol = "O";

  // Mode selection
  document.querySelectorAll(".mode-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      mode = e.currentTarget.dataset.mode;
      showScreen(sizeScreen);
    });
  });

  // Size selection
  document.querySelectorAll(".size-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      size = parseInt(e.currentTarget.dataset.size, 10);
      // rule: for 3x3 winLength=3, for larger (5/7) use 4 in a row
      winLength = (size === 3) ? 3 : 4;
      startGame();
      showScreen(gameScreen);
    });
  });

  // Restart whole app (back to mode)
  restartAppBtn.addEventListener("click", () => {
    showScreen(modeScreen);
  });

  // Play again re-initializes the same size & mode
  playAgainBtn.addEventListener("click", () => {
    startGame();
  });

  // show/hide screens
  function showScreen(screen) {
    [modeScreen, sizeScreen, gameScreen].forEach(s => {
      s.classList.remove("active");
      s.setAttribute("aria-hidden", "true");
    });
    screen.classList.add("active");
    screen.setAttribute("aria-hidden", "false");
  }

  // initialize board and render
  function startGame() {
    board = Array(size * size).fill("");
    gameOver = false;
    currentPlayer = firstIsXCheckbox.checked ? "X" : "O";
    aiSymbol = (currentPlayer === "X") ? "O" : "X";
    updateStatus(`${getPlayerName(currentPlayer)}'s turn`);
    renderBoard();
    // If single player and computer goes first, call AI
    if (mode === "single" && currentPlayer === aiSymbol) {
      doAIMove();
    }
  }

  function getPlayerName(symbol) {
    if (mode === "single") {
      return (symbol === aiSymbol) ? "Computer" : `Player ${symbol}`;
    }
    return `Player ${symbol}`;
  }

  function renderBoard() {
    // clear
    boardEl.innerHTML = "";
    boardEl.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

    board.forEach((cell, idx) => {
      const cellEl = document.createElement("button");
      cellEl.className = "cell";
      cellEl.dataset.idx = idx;
      cellEl.innerText = cell;
      cellEl.disabled = gameOver || cell !== "";
      cellEl.addEventListener("click", onCellClick);
      boardEl.appendChild(cellEl);
    });
  }

  function onCellClick(e) {
    if (gameOver) return;
    const idx = parseInt(e.currentTarget.dataset.idx, 10);
    if (board[idx] !== "") return;

    board[idx] = currentPlayer;
    renderBoard();

    if (checkWin(idx, currentPlayer)) {
      gameOver = true;
      updateStatus(`${getPlayerName(currentPlayer)} wins!`);
      highlightWinningCells(currentPlayer);
      return;
    }

    if (board.every(v => v !== "")) {
      gameOver = true;
      updateStatus("Draw!");
      return;
    }

    // switch player
    currentPlayer = (currentPlayer === "X") ? "O" : "X";
    updateStatus(`${getPlayerName(currentPlayer)}'s turn`);

    // if single-player and it's AI's turn, ask AI
    if (!gameOver && mode === "single" && currentPlayer === aiSymbol) {
      doAIMove();
    }
  }

  function updateStatus(text) {
    statusEl.innerText = text;
  }

  // Ask server for AI move
  function doAIMove() {
    // small delay to feel natural
    setTimeout(() => {
      fetch(AI_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          board: board,
          size: size,
          ai_symbol: aiSymbol
        })
      })
      .then(r => r.json())
      .then(data => {
        const idx = data.index;
        if (idx === null || idx === undefined) {
          // no move
          return;
        }
        board[idx] = aiSymbol;
        renderBoard();
        if (checkWin(idx, aiSymbol)) {
          gameOver = true;
          updateStatus(`Computer wins!`);
          highlightWinningCells(aiSymbol);
          return;
        }
        if (board.every(v => v !== "")) {
          gameOver = true;
          updateStatus("Draw!");
          return;
        }
        currentPlayer = (aiSymbol === "X") ? "O" : "X";
        updateStatus(`${getPlayerName(currentPlayer)}'s turn`);
      })
      .catch(err => {
        console.error("AI endpoint error:", err);
      });
    }, 350);
  }

  // check if placing at lastIndex by player creates a win of length winLength
  function checkWin(lastIndex, player) {
    const row = Math.floor(lastIndex / size);
    const col = lastIndex % size;

    // directions: [dr, dc]
    const directions = [
      [0, 1],   // horizontal
      [1, 0],   // vertical
      [1, 1],   // diag down-right
      [1, -1],  // diag down-left
    ];

    for (const [dr, dc] of directions) {
      let count = 1; // include last placed

      // check forward
      let r = row + dr;
      let c = col + dc;
      while (inBounds(r, c) && board[r * size + c] === player) {
        count++;
        r += dr;
        c += dc;
      }

      // check backward
      r = row - dr;
      c = col - dc;
      while (inBounds(r, c) && board[r * size + c] === player) {
        count++;
        r -= dr;
        c -= dc;
      }

      if (count >= winLength) return true;
    }
    return false;
  }

  // Optional: highlight winning cells (simple sweep to find any sequence)
  function highlightWinningCells(player) {
    // find any sequence of length winLength and highlight
    const directions = [
      [0, 1], [1, 0], [1, 1], [1, -1]
    ];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (board[r*size + c] !== player) continue;
        for (const [dr, dc] of directions) {
          const cells = [];
          let rr = r, cc = c;
          // forward collecting
          while (inBounds(rr, cc) && board[rr*size + cc] === player && cells.length < winLength) {
            cells.push(rr*size + cc);
            rr += dr;
            cc += dc;
          }
          if (cells.length >= winLength) {
            // highlight in DOM
            cells.slice(0, winLength).forEach(i => {
              const btn = boardEl.querySelector(`button[data-idx='${i}']`);
              if (btn) btn.classList.add("win");
            });
            return;
          }
        }
      }
    }
  }

  function inBounds(r, c) {
    return r >= 0 && r < size && c >= 0 && c < size;
  }

  // initial screen
  showScreen(modeScreen);
});




