const container = document.getElementById("puzzle-container");
const message = document.getElementById("message");
const timerDisplay = document.getElementById("timer");
const rankingList = document.getElementById("ranking");

let gridSize = 3;
let totalPieces = gridSize * gridSize;
let seconds = 0;
let interval;
let imageUrl = "";
let emptyPos = 0;

const bgColors = ['#1E1E2F', '#2F1E1E', '#1E2F1E', '#2F2F1E', '#1E2F2F'];

// 🔹 função auxiliar de mensagens animadas
function showMessage(text, persist = false) {
  message.textContent = text;
  message.classList.add("show");

  const timeout = persist ? 4000 : 1500;
  setTimeout(() => {
    message.classList.remove("show");
  }, timeout);
}

function startNewGame() {
  clearInterval(interval);
  seconds = 0;
  updateTimer();

  gridSize = parseInt(document.getElementById("difficulty").value);
  totalPieces = gridSize * gridSize;

  const imagens = ['img1.jpg', 'img2.jpg', 'img3.jpg', 'img4.jpg'];
  imageUrl = imagens[Math.floor(Math.random() * imagens.length)];

  const randomColor = bgColors[Math.floor(Math.random() * bgColors.length)];
  document.body.style.backgroundColor = randomColor;

  renderBoard();

  exibirRanking(gridSize);
  startTimer();

  showMessage("🚀 Nova partida iniciada!");
}

function renderBoard() {
  container.innerHTML = '';

  const boardSize = container.offsetWidth || 600;
  container.style.position = "relative";

  let positions = Array.from({ length: totalPieces }, (_, i) => i);

  emptyPos = shuffleSolvable(positions, gridSize, 200);

  positions = positions.filter(p => p !== emptyPos);

  const pieceSize = boardSize / gridSize;

  positions.forEach(pos => {
    const piece = document.createElement("div");
    piece.classList.add("piece");
    piece.dataset.position = pos;
    piece.style.width = `${pieceSize}px`;
    piece.style.height = `${pieceSize}px`;
    piece.style.position = "absolute";
    piece.style.left = `${(pos % gridSize) * pieceSize}px`;
    piece.style.top = `${Math.floor(pos / gridSize) * pieceSize}px`;

    piece.style.backgroundImage = `url('${imageUrl}')`;
    piece.style.backgroundSize = `${boardSize}px ${boardSize}px`;
    piece.style.backgroundPosition =
      `${-(pos % gridSize) * pieceSize}px ${-Math.floor(pos / gridSize) * pieceSize}px`;

    piece.addEventListener("click", () => movePiece(piece));
    container.appendChild(piece);
  });

  drawEmptySquare(pieceSize);
}

function drawEmptySquare(pieceSize) {
  let empty = document.createElement("div");
  empty.classList.add("empty");
  empty.style.width = `${pieceSize}px`;
  empty.style.height = `${pieceSize}px`;
  empty.style.position = "absolute";
  empty.style.left = `${(emptyPos % gridSize) * pieceSize}px`;
  empty.style.top = `${Math.floor(emptyPos / gridSize) * pieceSize}px`;
  container.appendChild(empty);
}

function movePiece(piece) {
  const piecePos = parseInt(piece.dataset.position);

  const emptyRow = Math.floor(emptyPos / gridSize);
  const emptyCol = emptyPos % gridSize;
  const pieceRow = Math.floor(piecePos / gridSize);
  const pieceCol = piecePos % gridSize;

  const isNeighbor =
    (Math.abs(emptyRow - pieceRow) === 1 && emptyCol === pieceCol) ||
    (Math.abs(emptyCol - pieceCol) === 1 && emptyRow === pieceRow);

  if (isNeighbor) {
    const pieceSize = container.clientWidth / gridSize;
    piece.style.left = `${(emptyPos % gridSize) * pieceSize}px`;
    piece.style.top = `${Math.floor(emptyPos / gridSize) * pieceSize}px`;

    const emptySquare = container.querySelector(".empty");
    emptySquare.style.left = `${(piecePos % gridSize) * pieceSize}px`;
    emptySquare.style.top = `${Math.floor(piecePos / gridSize) * pieceSize}px`;

    piece.dataset.position = emptyPos;
    emptyPos = piecePos;

    checkWin();
  }
}

function shuffleSolvable(positions, gridSize, moves = 200) {
  let emptyIndex = positions.length - 1;

  const directions = [
    { row: -1, col: 0 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
    { row: 0, col: 1 }
  ];

  for (let m = 0; m < moves; m++) {
    let emptyRow = Math.floor(emptyIndex / gridSize);
    let emptyCol = emptyIndex % gridSize;

    let validMoves = directions
      .map(d => {
        let newRow = emptyRow + d.row;
        let newCol = emptyCol + d.col;
        if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize) {
          return newRow * gridSize + newCol;
        }
        return null;
      })
      .filter(v => v !== null);

    let swapIndex = validMoves[Math.floor(Math.random() * validMoves.length)];
    [positions[emptyIndex], positions[swapIndex]] = [positions[swapIndex], positions[emptyIndex]];
    emptyIndex = swapIndex;
  }

  return emptyIndex;
}

function checkWin() {
  const pieces = document.querySelectorAll(".piece");
  const correct = Array.from(pieces).every((piece, index) => {
    return parseInt(piece.dataset.position) === index;
  });

  if (correct) {
    clearInterval(interval);
    const tempo = formatTime(seconds);
    const player = document.getElementById("nickname").value || "Anônimo";

    showMessage(`🎉 ${player}, você completou em ${tempo}!`, true);

    salvarRanking(player, seconds, gridSize);
    exibirRanking(gridSize);
  }
}

function salvarRanking(jogador, tempo, dificuldade) {
  const key = `ranking-${dificuldade}`;
  let ranking = JSON.parse(localStorage.getItem(key)) || [];
  ranking.push({ jogador, tempo });
  ranking.sort((a, b) => a.tempo - b.tempo);
  ranking = ranking.slice(0, 10);
  localStorage.setItem(key, JSON.stringify(ranking));
}

function exibirRanking(dificuldade) {
  const key = `ranking-${dificuldade}`;
  let ranking = JSON.parse(localStorage.getItem(key)) || [];
  rankingList.innerHTML = "";
  ranking.forEach((r, i) => {
    const li = document.createElement("li");
    li.textContent = `${i + 1}. ${r.jogador} - ${formatTime(r.tempo)}`;
    rankingList.appendChild(li);
  });
}

// timer
function startTimer() {
  interval = setInterval(() => {
    seconds++;
    updateTimer();
  }, 1000);
}
function updateTimer() {
  timerDisplay.textContent = `⏱️ ${formatTime(seconds)}`;
}
function formatTime(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function initProjectorMode() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  }
  startNewGame();
}

function shuffleBoard() {
  const sound = document.getElementById("shuffleSound");
  if (sound) sound.play();

  const pieces = Array.from(container.querySelectorAll(".piece"));
  let positions = Array.from({ length: totalPieces }, (_, i) => i);

  emptyPos = shuffleSolvable(positions, gridSize, 200);
  positions = positions.filter(p => p !== emptyPos);

  const boardSize = container.clientWidth;
  const pieceSize = boardSize / gridSize;

  pieces.forEach((piece, i) => {
    const pos = positions[i];
    piece.dataset.position = pos;
    piece.style.left = `${(pos % gridSize) * pieceSize}px`;
    piece.style.top = `${Math.floor(pos / gridSize) * pieceSize}px`;
  });

  const emptySquare = container.querySelector(".empty");
  emptySquare.style.left = `${(emptyPos % gridSize) * pieceSize}px`;
  emptySquare.style.top = `${Math.floor(emptyPos / gridSize) * pieceSize}px`;

  showMessage("🔀 Embaralhado!");
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen();
  }
}
