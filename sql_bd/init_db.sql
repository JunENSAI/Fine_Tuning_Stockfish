
CREATE SCHEMA IF NOT EXISTS chess_bot;

-- 1. Table des Parties
DROP TABLE IF EXISTS chess_bot.games CASCADE;
CREATE TABLE chess_bot.games (
    game_id VARCHAR(255) PRIMARY KEY,
    white_player VARCHAR(100),
    black_player VARCHAR(100),
    white_elo INT,
    black_elo INT,
    date_played DATE,
    result VARCHAR(10),
    opening_code VARCHAR(10),
    pgn_event VARCHAR(255)
);

-- 2. Table des Coups (Positions)
DROP TABLE IF EXISTS chess_bot.moves CASCADE;
CREATE TABLE chess_bot.moves (
    id SERIAL PRIMARY KEY,
    game_id VARCHAR(255) REFERENCES chess_bot.games(game_id) ON DELETE CASCADE,
    fen VARCHAR(255) NOT NULL,
    turn VARCHAR(10),
    move_number INT,
    played_move VARCHAR(10),
    stockfish_best_move VARCHAR(10),
    eval_score INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Index pour la performance (Vital pour le futur Bot)
CREATE INDEX idx_moves_fen ON chess_bot.moves(fen);
CREATE INDEX idx_games_opening ON chess_bot.games(opening_code);