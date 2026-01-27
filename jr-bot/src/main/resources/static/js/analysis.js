let board = null;
let game = new Chess();
let currentPgn = "";
let moveHistory = [];
let currentMoveIndex = -1; // -1 = début de partie
let stockfish = null;

document.addEventListener("DOMContentLoaded", () => {
    initBoard();
    initStockfish();
    loadGamesList();
});

// --- 1. INITIALISATION STOCKFISH ---
function initStockfish() {
    // On lance le Worker (fil d'exécution séparé)
    stockfish = new Worker('js/stockfish.js');
    
    stockfish.onmessage = function(event) {
        const line = event.data;
        
        // On cherche la ligne qui donne le score (ex: "info depth 10 ... score cp 50 ...")
        if (line.startsWith("info") && line.includes("score") && line.includes("pv")) {
            parseStockfishInfo(line);
        }
    };
    
    stockfish.postMessage("uci"); // Démarrage
}

function parseStockfishInfo(line) {
    // 1. Récupérer le score
    let score = 0.0;
    
    // Cas Mat (mate)
    if (line.includes("score mate")) {
        const parts = line.split("score mate ")[1].split(" ")[0];
        score = parseInt(parts) > 0 ? 1000 : -1000; // Mat blanc ou noir
        document.getElementById("eval-score").innerText = `M${parts}`;
    } 
    // Cas Centipawns (cp)
    else if (line.includes("score cp")) {
        const parts = line.split("score cp ")[1].split(" ")[0];
        const cp = parseInt(parts);
        const turnMultiplier = game.turn() === 'w' ? 1 : -1;
        
        score = cp / 100.0;
        document.getElementById("eval-score").innerText = (score > 0 ? "+" : "") + score.toFixed(1);
        updateEvalBar(cp); 
    }

    // 2. Récupérer le meilleur coup (pv = principal variation)
    if (line.includes(" pv ")) {
        const bestMove = line.split(" pv ")[1].split(" ")[0];
        document.getElementById("best-move-display").innerText = `Meilleur coup : ${bestMove}`;
        highlightBestMove(bestMove);
    }
}

function updateEvalBar(cp) {
    // Formule pour transformer le score (-1000 à +1000) en pourcentage (0 à 100%)
    // On cap à +/- 500 cp (5 pions d'avance = barre pleine)
    let percent = 50 + (cp / 10); 
    if (percent > 100) percent = 100;
    if (percent < 0) percent = 0;
    
    const turn = game.turn();
    let whiteHeight, blackHeight;

    // Ajustement visuel simple
    // Si cp = 100 (avantage 1 pion), on veut que la barre blanche monte
    if (turn === 'b') cp = -cp;

    // Recalcul avec référentiel absolu
    percent = 50 + (cp / 10);
    if (percent > 100) percent = 100;
    if (percent < 0) percent = 0;

    document.getElementById("eval-white").style.height = `${percent}%`;
    document.getElementById("eval-black").style.height = `${100 - percent}%`;
}

function analyzePosition() {
    if (!stockfish) return;
    const fen = game.fen();
    
    // On nettoie les highlights précédents
    document.querySelectorAll('.square-55d63').forEach(sq => sq.classList.remove('highlight-best'));

    // On demande à Stockfish d'analyser cette position
    stockfish.postMessage(`position fen ${fen}`);
    stockfish.postMessage("go depth 15"); // Profondeur 15 (assez rapide)
}

function highlightBestMove(move) {
    // move est type "e2e4"
    const from = move.substring(0, 2);
    const to = move.substring(2, 4);
    
    const $board = $('#board');
    $board.find('.square-' + from).addClass('highlight-best');
    $board.find('.square-' + to).addClass('highlight-best');
}


// --- 2. GESTION LISTE PARTIES ---
async function loadGamesList() {
    const user = localStorage.getItem("username");
    const res = await fetch(`/api/platform/my-games?username=${user}`);
    const games = await res.json();
    
    const container = document.getElementById("games-container");
    container.innerHTML = "";
    
    games.forEach(g => {
        const div = document.createElement("div");
        div.className = "game-item";
        
        // Couleur du badge selon TimeControl
        let badgeColor = "#555";
        if (g.timeControl === "Bullet") badgeColor = "#e57373";
        if (g.timeControl === "Blitz") badgeColor = "#ffca28"; // Jaune
        if (g.timeControl === "Rapide") badgeColor = "#66bb6a"; // Vert

        div.innerHTML = `
            <div>
                <span class="badge" style="color:#000; background:${badgeColor}">${g.timeControl || 'Standard'}</span>
                <strong>${g.whitePlayer}</strong> vs <strong>${g.blackPlayer}</strong>
            </div>
            <div style="font-size:0.8em; color:#888;">${g.result}</div>
        `;
        div.onclick = () => loadGame(g);
        container.appendChild(div);
    });
}

function loadGame(g) {
    // Mise à jour Titre
    document.getElementById("game-title").innerText = `${g.whitePlayer} vs ${g.blackPlayer} (${g.result})`;
    
    // Chargement PGN
    currentPgn = g.pgnText; // Assure-toi que ton entité Java renvoie bien pgnText
    game.load_pgn(currentPgn);
    
    // On récupère tout l'historique pour pouvoir naviguer
    moveHistory = game.history();
    
    // On remet le plateau au début
    game.reset();
    currentMoveIndex = -1;
    board.position(game.fen());
    analyzePosition(); // Analyse position de départ
}


// --- 3. NAVIGATION ET PLATEAU ---
function initBoard() {
    const config = {
        position: 'start',
        pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
    };
    board = Chessboard('board', config);
}

function nextMove() {
    if (currentMoveIndex < moveHistory.length - 1) {
        currentMoveIndex++;
        game.move(moveHistory[currentMoveIndex]);
        board.position(game.fen());
        analyzePosition();
    }
}

function prevMove() {
    if (currentMoveIndex >= 0) {
        game.undo();
        currentMoveIndex--;
        board.position(game.fen());
        analyzePosition();
    }
}

function firstMove() {
    game.reset();
    currentMoveIndex = -1;
    board.position(game.fen());
    analyzePosition();
}

function lastMove() {
    // Reset et rejoue tout
    game.load_pgn(currentPgn);
    currentMoveIndex = moveHistory.length - 1;
    board.position(game.fen());
    analyzePosition();
}

function flipBoard() {
    board.flip();
    analyzePosition();
}