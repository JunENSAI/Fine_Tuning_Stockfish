package com.chess.jr_bot.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.chess.jr_bot.dto.GameSave;
import com.chess.jr_bot.dto.Stats;
import com.chess.jr_bot.entity.GameEntity;
import com.chess.jr_bot.repository.GameRepository;

@RestController
@RequestMapping("/api/platform")
@CrossOrigin(origins = "*")
public class GameController {

    private static final Logger logger = Logger.getLogger(GameController.class.getName());

    private final GameRepository gameRepository;

    public GameController(GameRepository gameRepository) {
        this.gameRepository = gameRepository;
    }

    // --- 1. SAUVEGARDE  ---
    @PostMapping("/save")
    public ResponseEntity<?> saveGame(@RequestBody GameSave request) {
        try {
            GameEntity game = new GameEntity();
            game.setWhitePlayer(request.getWhitePlayer());
            game.setBlackPlayer(request.getBlackPlayer());
            game.setResult(request.getResult());
            game.setPgnText(request.getPgn());
            game.setTimeControl(request.getTimeControl() != null ? request.getTimeControl() : "Standard");
            game.setDatePlayed(LocalDateTime.now());

            gameRepository.save(game);

            return ResponseEntity.ok(Map.of("message", "Partie sauvegardée avec succès !"));
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Erreur", e);
            return ResponseEntity.internalServerError().body("Erreur lors de la sauvegarde.");
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getPlayerStats(@RequestParam String username) {
        List<GameEntity> games = gameRepository.findByWhitePlayerOrBlackPlayer(username, username);

        // Map pour stocker les stats
        Map<String, Stats> statsMap = new HashMap<>();
        statsMap.put("Global", new Stats());
        statsMap.put("Bullet", new Stats());
        statsMap.put("Blitz", new Stats());
        statsMap.put("Rapide", new Stats());
        statsMap.put("Daily", new Stats());

        for (GameEntity g : games) {
            boolean isWhite = username.equals(g.getWhitePlayer());

            statsMap.get("Global").addResult(g.getResult(), isWhite);

            String category = "Unknown";
            String rawTc = g.getTimeControl();
            
            if (rawTc != null) {
                String tcClean = rawTc.contains("+") ? rawTc.split("\\+")[0] : rawTc;
                if (tcClean.matches("\\d+")) {
                    int seconds = Integer.parseInt(tcClean);
                    if (seconds >= 60 && seconds <= 120) category = "Bullet";
                    else if (seconds >= 180 && seconds <= 300) category = "Blitz";
                    else if (seconds >= 600 && seconds <= 900) category = "Rapide";
                    else if (seconds >= 1440) category = "Daily";
                }
                else {
                    String textTitle = tcClean.substring(0, 1).toUpperCase() + tcClean.substring(1).toLowerCase();
                    if (statsMap.containsKey(textTitle)) {
                        category = textTitle;
                    }
                }
            }

            if (statsMap.containsKey(category)) {
                statsMap.get(category).addResult(g.getResult(), isWhite);
            }
        }

        return ResponseEntity.ok(statsMap);
    }

    @GetMapping("/history")
    public ResponseEntity<List<GameEntity>> getPlayerHistory(@RequestParam String username) {
        List<GameEntity> history = gameRepository.findTop50ByWhitePlayerOrBlackPlayerOrderByDatePlayedDesc(username, username);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/my-games")
    public ResponseEntity<List<GameEntity>> getMyGames(@RequestParam String username) {
        List<GameEntity> games = gameRepository.findByWhitePlayerOrBlackPlayerOrderByDatePlayedDesc(username, username);
        return ResponseEntity.ok(games);
    }
}