document.addEventListener('DOMContentLoaded', () => {
  // UI Elements
  const startScreen = document.getElementById('start-screen');
  const gameScreen = document.getElementById('game-screen');
  const winScreen = document.getElementById('win-screen');
  const failScreen = document.getElementById('fail-screen');
  const startButton = document.getElementById('start-button');
  const claimRewardButton = document.getElementById('claim-reward-button');
  const tryAgainButton = document.getElementById('try-again-button');
  const cells = document.querySelectorAll('.cell');

  // Game State
  let currentPlayer = 'x';
  let board = Array(9).fill(null);
  let gameActive = true;
  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
  ];

  // Window Controls Setup
  function setupWindowControls(container) {
    const closeButtons = container.querySelectorAll('.close-button');
    const shrinkButtons = container.querySelectorAll('.shrink-button');

    closeButtons.forEach(btn => {
      btn.addEventListener('click', () => window.electronAPI.closeWindow());
    });

    shrinkButtons.forEach(btn => {
      btn.addEventListener('click', () => window.electronAPI.minimizeWindow());
    });
  }

  // Game Functions
  function handleCellClick(index) {
    if (board[index] || !gameActive) return;

    board[index] = currentPlayer;
    const cell = cells[index];
    const button = cell.querySelector('button');
    button.innerHTML = ''; // Clear existing content
    const img = document.createElement('img');
    img.src = currentPlayer === 'x' ? 'assets/heart.png' : 'assets/letter.png';
    img.style.width = '60%'; // Match the original size
    img.style.height = '60%';
    img.style.filter = currentPlayer === 'x' ? 'drop-shadow(0 0 6px rgba(255, 0, 100, 0.8))' : 'drop-shadow(0 0 6px rgba(100, 200, 255, 0.8))';
    img.style.position = 'absolute';
    img.style.top = '50%';
    img.style.left = '50%';
    img.style.transform = 'translate(-50%, -50%)'; // Center the image
    button.appendChild(img);

    if (checkWin()) {
      const winningCells = winningCombinations.find(combo => combo.every(index => board[index] === currentPlayer));
      winningCells.forEach(index => cells[index].classList.add('win'));
      gameActive = false;
      setTimeout(() => {
        gameScreen.style.display = 'none';
        winScreen.style.display = 'block';
        setupWindowControls(winScreen);
      }, 1000);
      return;
    }

    if (board.every(cell => cell)) {
      gameActive = false;
      setTimeout(() => {
        gameScreen.style.display = 'none';
        failScreen.style.display = 'block';
        setupWindowControls(failScreen);
      }, 1000);
      return;
    }

    currentPlayer = currentPlayer === 'x' ? 'o' : 'x';
  }

  function checkWin() {
    return winningCombinations.some(combo => {
      return combo.every(index => board[index] === currentPlayer);
    });
  }

  function resetGame() {
    board.fill(null);
    cells.forEach((cell, index) => {
      const button = cell.querySelector('button');
      button.innerHTML = ''; // Clear existing content
      const initialImg = document.createElement('img');
      initialImg.src = `assets/${index + 1}.png`;
      initialImg.style.width = '100%';
      initialImg.style.height = '100%';
      button.appendChild(initialImg);
      cell.className = 'cell'; // Reset all classes
    });
    currentPlayer = 'x';
    gameActive = true;
    startScreen.style.display = 'block';
    gameScreen.style.display = 'none';
    winScreen.style.display = 'none';
    failScreen.style.display = 'none';
    setupWindowControls(startScreen);
  }

  // Initial Setup
  setupWindowControls(startScreen);

  // Event Listeners
  startButton.addEventListener('click', () => {
    startScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    setupWindowControls(gameScreen);
  });

  claimRewardButton.addEventListener('click', resetGame);
  tryAgainButton.addEventListener('click', resetGame);

  cells.forEach((cell, index) => {
    const button = document.createElement('button');
    button.style.width = '100%';
    button.style.height = '100%';
    button.style.background = 'transparent';
    button.style.border = 'none';
    button.style.cursor = 'pointer';
    button.style.position = 'relative'; // Ensure relative positioning for absolute child
    button.style.borderRadius = '15px'; // Rounded corners
    button.style.overflow = 'hidden'; // Ensure image respects rounded corners
    const initialImg = document.createElement('img');
    initialImg.src = `assets/${index + 1}.png`;
    initialImg.style.width = '100%';
    initialImg.style.height = '100%';
    initialImg.style.objectFit = 'cover'; // Ensure image fills the button shape
    button.appendChild(initialImg);
    button.addEventListener('click', () => handleCellClick(index));
    cell.appendChild(button);
  });

  // Remove hover effect causing alignment issues
  cells.forEach(cell => {
    cell.style.backgroundColor = 'transparent'; // Remove hover background
    cell.style.transform = 'none'; // Remove scale transform
  });

  // Set fixed window size on load
  window.electronAPI.setWindowSize(400, 400);
});
