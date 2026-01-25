package com.chess.jr_bot.dto;

import lombok.Data;

@Data
public class GameSave {
    private String whitePlayer;
    private String blackPlayer;
    private String result;
    private String pgn;
    private String timeControl;
}