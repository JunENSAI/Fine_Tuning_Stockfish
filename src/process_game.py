import os
import chess
import chess.pgn
import chess.engine
import pandas as pd
import logging
from dotenv import load_dotenv

# ---------------- CONFIG ----------------
load_dotenv()

PGN_FILE = "/home/junior/Fine_Tuning_Stockfish/data_pgn/user_pgn.pgn"
STOCKFISH_PATH = "/usr/games/stockfish"
DEPTH = 14

MY_USERNAME = os.getenv("user_name")
if not MY_USERNAME:
    raise ValueError("Variable d'environnement user_name non définie")

LOG_EVERY_N_GAMES = 200

# ---------------- LOGGING ----------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)

def analyze_pgn():
    logging.info("Initialisation du moteur Stockfish")
    engine = chess.engine.SimpleEngine.popen_uci(STOCKFISH_PATH)

    games_data = []
    moves_data = []

    games_read = 0
    games_analyzed = 0

    with open(PGN_FILE) as pgn:
        while True:
            game = chess.pgn.read_game(pgn)
            if game is None:
                break

            games_read += 1

            if games_read % LOG_EVERY_N_GAMES == 0:
                logging.info(
                    f"{games_read} parties lues | "
                    f"{games_analyzed} parties analysées"
                )

            headers = game.headers
            white = headers.get("White", "?")
            black = headers.get("Black", "?")
            date_played = headers.get("Date", "1970.01.01").replace(".", "-")

            game_id = f"{games_read}_{date_played}_{white}_{black}".replace(" ", "_")

            games_data.append({
                "game_id": game_id,
                "white_player": white,
                "black_player": black,
                "white_elo": headers.get("WhiteElo", None),
                "black_elo": headers.get("BlackElo", None),
                "date_played": date_played,
                "result": headers.get("Result", "*"),
                "opening_code": headers.get("ECO", ""),
                "pgn_event": headers.get("Event", "")
            })

            if white == MY_USERNAME:
                my_color = chess.WHITE
            elif black == MY_USERNAME:
                my_color = chess.BLACK
            else:
                continue

            games_analyzed += 1
            board = game.board()

            for node in game.mainline():
                if board.turn == my_color:
                    info = engine.analyse(
                        board,
                        chess.engine.Limit(depth=DEPTH)
                    )

                    best_move = info["pv"][0].uci() if "pv" in info else None
                    score = info["score"].pov(my_color).score(mate_score=10000)

                    moves_data.append({
                        "game_id": game_id,
                        "fen": board.fen(),
                        "move_number": board.fullmove_number,
                        "played_move": node.move.uci(),
                        "stockfish_best_move": best_move,
                        "eval_score": score
                    })

                board.push(node.move)

    engine.quit()

    logging.info("Analyse terminée")
    logging.info(f"Total parties lues      : {games_read}")
    logging.info(f"Total parties analysées : {games_analyzed}")
    logging.info(f"Total positions stockées: {len(moves_data)}")

    pd.DataFrame(games_data).to_csv("games.csv", index=False)
    pd.DataFrame(moves_data).to_csv("moves.csv", index=False)

    logging.info("Exports générés : games.csv, moves.csv")

if __name__ == "__main__":
    analyze_pgn()
