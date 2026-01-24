package com.chess.jr_bot.service;

import java.util.List;
import java.util.Random;

import org.springframework.stereotype.Service;

import com.chess.jr_bot.entity.MoveEntity;
import com.chess.jr_bot.repository.MoveRepository;

@Service
public class BotService {

    private final MoveRepository moveRepository;
    private final Random random = new Random();

    public BotService(MoveRepository moveRepository) {
        this.moveRepository = moveRepository;
    }

    public String decideMove(String currentFen) {
        // 1. Chercher si on connait cette position dans la BDD
        String fenPosition = currentFen.split(" ")[0]; 
        
        List<MoveEntity> knownMoves = moveRepository.findByFenStartingWith(fenPosition);

        if (knownMoves.isEmpty()) {
            return "UNKNOWN";
        }

        // 2. Sélectionner un coup parmi l'historique
        MoveEntity selectedMove = knownMoves.get(random.nextInt(knownMoves.size()));

        
        System.out.println("Position connue ! Coup historique : " + selectedMove.getPlayedMove());
        
        if (selectedMove.getEvalScore() != null && selectedMove.getEvalScore() < -150) {
             System.out.println("Correction : Le coup historique était mauvais. Utilisation de Stockfish.");
             return selectedMove.getStockfishBestMove();
        }

        return selectedMove.getPlayedMove();
    }
}