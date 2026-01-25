package com.chess.jr_bot.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "platform_games", schema = "chess_bot")
@Data
public class GameEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "white_player")
    private String whitePlayer;

    @Column(name = "black_player")
    private String blackPlayer;

    private String result; // "1-0", "0-1", "1/2-1/2"

    @Column(name = "pgn_text", columnDefinition = "TEXT")
    private String pgnText;

    @Column(name = "time_control")
    private String timeControl; // "Blitz", "Rapid", etc.

    @Column(name = "date_played")
    private LocalDateTime datePlayed = LocalDateTime.now();
}