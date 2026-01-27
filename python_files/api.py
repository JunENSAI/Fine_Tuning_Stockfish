from flask import Flask, request, jsonify
import chess
import chess.engine

app = Flask(__name__)

STOCKFISH_PATH = "/usr/games/stockfish"
MOVE_TIME = 0.3  # secondes

print("Démarrage du moteur Stockfish...")
try:
    engine = chess.engine.SimpleEngine.popen_uci(STOCKFISH_PATH)

    engine.configure({
        "UCI_LimitStrength": True,
        "UCI_Elo": 1900
    })

except Exception as e:
    print(f"ERREUR CRITIQUE: Impossible de lancer Stockfish : {e}")
    exit(1)

@app.route('/analyze', methods=['GET'])
def analyze():
    fen = request.args.get('fen')

    if not fen:
        return jsonify({"error": "No FEN provided"}), 400

    board = chess.Board(fen)

    try:
        limit = chess.engine.Limit(time=MOVE_TIME)

        result = engine.play(board, limit)
        best_move = result.move.uci()

        info = engine.analyse(board, limit)
        score = info["score"].white().score(mate_score=10000)

        return jsonify({
            "best_move": best_move,
            "score": score
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
