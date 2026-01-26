package com.chess.jr_bot.dto;

// DTO pour stocker les stats (Victoires, Défaites, Nulles, Total)
public class Stats {
    public int wins = 0;
    public int losses = 0;
    public int draws = 0;
    public int total = 0;

    public void addResult(String result, boolean isPlayerWhite) {
        total++;
        if ("1/2-1/2".equals(result)) {
            draws++;
        } else if ((isPlayerWhite && "1-0".equals(result)) || (!isPlayerWhite && "0-1".equals(result))) {
            wins++;
        } else {
            losses++;
        }
    }
}