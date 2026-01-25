package com.chess.jr_bot.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.chess.jr_bot.entity.UserEntity;

public interface UserRepository extends JpaRepository<UserEntity, Long> {
    Optional<UserEntity> findByUsername(String username);
}