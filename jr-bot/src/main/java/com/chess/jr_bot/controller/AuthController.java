package com.chess.jr_bot.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chess.jr_bot.dto.Login;
import com.chess.jr_bot.entity.UserEntity;
import com.chess.jr_bot.repository.UserRepository;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Login request) {
        Optional<UserEntity> userOpt = userRepository.findByUsername(request.getUsername());

        if (userOpt.isPresent()) {
            UserEntity user = userOpt.get();
            if (user.getPassword().equals(request.getPassword())) {
                return ResponseEntity.ok(Map.of(
                    "message", "Login success",
                    "username", user.getUsername(),
                    "userId", user.getId()
                ));
            }
        }
        
        return ResponseEntity.status(401).body(Map.of("message", "Mauvais identifiants"));
    }
}