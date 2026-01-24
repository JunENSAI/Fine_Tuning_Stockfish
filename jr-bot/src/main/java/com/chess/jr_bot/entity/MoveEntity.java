package com.chess.jr_bot.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "moves", schema = "chess_bot")
@Data
public class MoveEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "game_id")
    private String gameId;

    @Column(nullable = false)
    private String fen;

    private String turn; // "white" ou "black"

    @Column(name = "played_move")
    private String playedMove; // Le coup que j'ai joué

    @Column(name = "stockfish_best_move") // le coup de l'ordi
    private String stockfishBestMove;

    @Column(name = "eval_score")
    private Integer evalScore;
}