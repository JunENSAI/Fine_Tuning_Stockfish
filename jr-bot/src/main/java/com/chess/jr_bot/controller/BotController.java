package com.chess.jr_bot.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.chess.jr_bot.service.BotService;

@RestController
@RequestMapping("/api/bot")
@CrossOrigin(origins = "*") // Autorise le frontend à appeler l'API
public class BotController {

    private final BotService botService;

    public BotController(BotService botService) {
        this.botService = botService;
    }

    @GetMapping("/move")
    public String getMove(@RequestParam String fen) {
        return botService.decideMove(fen);
    }
}