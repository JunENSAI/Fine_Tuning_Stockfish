package com.chess.jr_bot.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.chess.jr_bot.dto.GameSave;
import com.chess.jr_bot.entity.GameEntity;
import com.chess.jr_bot.repository.GameRepository;

@RestController
@RequestMapping("/api/platform")
@CrossOrigin(origins = "*")
public class GameController {

    private final GameRepository GameRepository;

    public GameController(GameRepository GameRepository) {
        this.GameRepository = GameRepository;
    }

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

            GameRepository.save(game);

            return ResponseEntity.ok(Map.of("message", "Partie sauvegardée avec succès !"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Erreur lors de la sauvegarde.");
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getPlayerStats(@RequestParam String username) {
        long platformGames = GameRepository.countTotalGames(username);
        long platformWins = GameRepository.countWins(username);

        long historicalGames = 5736; 
        long historicalWins = 2000;

        long totalGames = historicalGames + platformGames;
        long totalWins = historicalWins + platformWins;
        
        double winRate = totalGames > 0 ? (double) totalWins / totalGames * 100 : 0;

        Map<String, Object> stats = new HashMap<>();
        stats.put("username", username);
        stats.put("total_games", totalGames);
        stats.put("total_wins", totalWins);
        stats.put("win_rate", String.format("%.2f", winRate));
        stats.put("platform_games_played", platformGames);

        return ResponseEntity.ok(stats);
    }
}
