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

const bgColors = ['#1E1E2F', '#2F1E1E', '#1E2F1E', '#1E2F2F', '#2F2F1E'];

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

  container.innerHTML = '';

  const boardSize = container.clientWidth; // pega tamanho dinâmico
  container.style.position = "relative";

  let positions = Array.from({ length: totalPieces }, (_, i) => i);
  shuffle(positions);

  const pieceSize = boardSize / gridSize;

  // pega a posição que será o vazio
  emptyPos = positions.pop();

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

  // desenhar o quadrado vazio
  drawEmptySquare(pieceSize);

  message.textContent = '';
  exibirRanking(gridSize);
  startTimer();
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

// embaralhar
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function checkWin() {
  const pieces = document.querySelectorAll(".piece");
  const correct = Array.from(pieces).every((piece, index) => {
    return parseInt(piece.dataset.position) === index;
  });

  if (correct && emptyPos === totalPieces - 1) {
    clearInterval(interval);
    const tempo = formatTime(seconds);
    const player = document.getElementById("nickname").value || "Anônimo";
    message.textContent = `🎉 ${player}, você completou em ${tempo}!`;

    salvarRanking(player, seconds, gridSize);
    exibirRanking(gridSize);
  }
}

// ranking local
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

// Modo projetor: tela cheia automática
function initProjectorMode() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  }
  startNewGame();
}