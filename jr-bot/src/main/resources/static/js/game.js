let board = null;
let game = new Chess();
let userColor = 'white';
let selectedTime = 300;
let whiteTime = 300;
let blackTime = 300;
let timerInterval = null;
let gameActive = false;
let botPhrases = {};

const username = localStorage.getItem("username") || "Invité";

// --- 1. SETUP ET LANCEMENT ---

document.addEventListener("DOMContentLoaded", async () => {
    document.getElementById("playerName").innerText = username;
    // Charger les phrases du bot
    try {
        const res = await fetch('json/bot_phrases.json');
        botPhrases = await res.json();
    } catch (e) { console.error("Pas de phrases trouvées"); }
});

function selectColor(color) {
    userColor = color;
    document.getElementById('btnW').className = color === 'white' ? 'selected' : '';
    document.getElementById('btnB').className = color === 'black' ? 'selected' : '';
}

function startGame() {
    // 1. Récupérer les options
    const timeVal = document.getElementById("timeControlSelect").value;
    if (timeVal === "no-limit") {
        selectedTime = null;
        document.getElementById("clock-white").innerText = "∞";
        document.getElementById("clock-black").innerText = "∞";
    } else {
        selectedTime = parseInt(timeVal);
        whiteTime = selectedTime;
        blackTime = selectedTime;
        updateClockDisplay();
    }

    // 2. Initialiser l'interface
    document.querySelector(".game-container").style.filter = "none";
    document.getElementById("setupModal").style.display = "none";
    
    // 3. Lancer le jeu
    initBoard();
    gameActive = true;
    speak("intro");
    
    if (selectedTime) startTimer();
}

function initBoard() {
    game = new Chess();
    const config = {
        draggable: true,
        position: 'start',
        orientation: userColor,
        onDragStart: onDragStart,
        onDrop: onDrop,
        onSnapEnd: onSnapEnd,
        pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
    };
    board = Chessboard('board', config);

    // Si le joueur est Noir, le bot (Blanc) joue tout de suite
    if (userColor === 'black') {
        setTimeout(makeBotMove, 500);
    }
}

// --- 2. LOGIQUE DU TIMER ---

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
        if (!gameActive) return;

        if (game.turn() === 'w') {
            whiteTime--;
            if (whiteTime <= 0) timeOut('white');
        } else {
            blackTime--;
            if (blackTime <= 0) timeOut('black');
        }
        updateClockDisplay();
    }, 1000);
}

function updateClockDisplay() {
    if (!selectedTime) return;

    const wDiv = document.getElementById("clock-white");
    const bDiv = document.getElementById("clock-black");

    wDiv.innerText = formatTime(whiteTime);
    bDiv.innerText = formatTime(blackTime);

    // Effet visuel "Qui joue ?"
    if (game.turn() === 'w') {
        wDiv.classList.add("active-clock");
        bDiv.classList.remove("active-clock");
    } else {
        bDiv.classList.add("active-clock");
        wDiv.classList.remove("active-clock");
    }
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function timeOut(color) {
    gameActive = false;
    clearInterval(timerInterval);
    const loser = color === 'white' ? "Blancs" : "Noirs";
    alert(`Temps écoulé ! Les ${loser} ont perdu.`);
    speak("timeout");
    
    // On sauvegarde la défaite
    let result = (color === 'white') ? "0-1" : "1-0"; // Si Blanc perd au temps, Noir gagne
    saveGame(result);
}

// --- 3. JEU & CHAT ---

function onDragStart(source, piece) {
    if (game.game_over() || !gameActive) return false;
    // Vérifier la couleur
    if ((userColor === 'white' && piece.search(/^b/) !== -1) ||
        (userColor === 'black' && piece.search(/^w/) !== -1)) {
        return false;
    }
}

function onDrop(source, target) {
    const move = game.move({ from: source, to: target, promotion: 'q' });
    if (move === null) return 'snapback';

    // Chat sur capture
    if (move.captured) speak("capture");
    if (game.in_check()) speak("check");

    updateStatus();
    makeBotMove();
}

function onSnapEnd() { board.position(game.fen()); }

async function makeBotMove() {
    if (game.game_over() || !gameActive) return checkGameOver();

    // Appel API
    try {
        const url = `/api/bot/move?fen=${encodeURIComponent(game.fen())}`;
        const res = await fetch(url);
        const botMove = await res.text();
        
        game.move(botMove, { sloppy: true });
        board.position(game.fen());
        
        if (game.in_check()) speak("check");
        checkGameOver();
        
    } catch (e) { console.error("Bot Error", e); }
}

function checkGameOver() {
    if (game.game_over()) {
        gameActive = false;
        clearInterval(timerInterval);
        
        let result = "1/2-1/2";
        if (game.in_checkmate()) {
            const winner = game.turn() === 'w' ? "Noirs" : "Blancs";
            result = winner === "Blancs" ? "1-0" : "0-1";
            
            // Le Bot parle
            if ((userColor === 'white' && winner === 'Noirs') || (userColor === 'black' && winner === 'Blancs')) {
                speak("win");
            } else {
                speak("draw");
            }
        } else {
            speak("loss");
        }
        
        saveGame(result);
        return true;
    }
    return false;
}

// --- 4. SYSTEME DE CHAT ---
let bubbleTimeout;
function speak(category) {
    if (!botPhrases[category]) return;

    if (category !== 'intro' && category !== 'win' && category !== 'loss' && category !== 'timeout') {
        if (Math.random() > 0.3) return; 
    }

    const phrases = botPhrases[category];
    const text = phrases[Math.floor(Math.random() * phrases.length)];
    
    const bubble = document.getElementById("bot-bubble");
    bubble.innerText = text;
    bubble.style.display = "block";

    // Cacher après 4 secondes
    clearTimeout(bubbleTimeout);
    bubbleTimeout = setTimeout(() => {
        bubble.style.display = "none";
    }, 4000);
}

function endGame(action) {
    if (!gameActive) return;
    let result = "1/2-1/2";
    if (action === 'resign') {
        result = userColor === 'white' ? "0-1" : "1-0";
        speak("win");
    } else if (action === 'draw') {
        speak("draw");
    }
    gameActive = false;
    clearInterval(timerInterval);
    saveGame(result);
}

async function saveGame(result) {
    // Convertir le temps sélectionné en String pour l'API (ex: 300 -> "Blitz")
    let timeLabel = "Standard";
    if (selectedTime <= 120) timeLabel = "Bullet";
    else if (selectedTime <= 300) timeLabel = "Blitz";
    else if (selectedTime <= 900) timeLabel = "Rapide";

    try {
        await fetch('/api/platform/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                whitePlayer: userColor === 'white' ? username : "Bot-JRRZF",
                blackPlayer: userColor === 'black' ? username : "Bot-JRRZF",
                result: result,
                pgn: game.pgn(),
                timeControl: timeLabel 
            })
        });
        setTimeout(() => window.location.href = "dashboard.html", 2000);
    } catch (e) { console.error(e); }
}

function updateStatus() {
    let status = "";
    let moveColor = game.turn() === 'b' ? 'Noirs' : 'Blancs';

    if (game.in_check()) {
        status += moveColor + " sont en échec ! ";
    }
    document.getElementById("status").innerText = status;
}