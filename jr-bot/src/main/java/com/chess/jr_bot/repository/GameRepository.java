package com.chess.jr_bot.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.chess.jr_bot.entity.GameEntity;

public interface GameRepository extends JpaRepository<GameEntity, Long> {


    List<GameEntity> findByWhitePlayerOrBlackPlayer(String whitePlayer, String blackPlayer);

    List<GameEntity> findByWhitePlayerOrBlackPlayerOrderByDatePlayedDesc(String whitePlayer, String blackPlayer);

    List<GameEntity> findTop50ByWhitePlayerOrBlackPlayerOrderByDatePlayedDesc(String whitePlayer, String blackPlayer);

    @Query("SELECT COUNT(g) FROM GameEntity g WHERE " +
           "(g.whitePlayer = :player AND g.result = '1-0') OR " +
           "(g.blackPlayer = :player AND g.result = '0-1')")
    long countWins(@Param("player") String player);

    @Query("SELECT COUNT(g) FROM GameEntity g WHERE g.whitePlayer = :player OR g.blackPlayer = :player")
    long countTotalGames(@Param("player") String player);
}