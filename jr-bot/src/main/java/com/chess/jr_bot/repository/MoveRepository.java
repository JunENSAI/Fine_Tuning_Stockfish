package com.chess.jr_bot.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.chess.jr_bot.entity.MoveEntity;

public interface MoveRepository extends JpaRepository<MoveEntity, Long> {

    // Trouve tous les coups joués dans cette position exacte
    List<MoveEntity> findByFen(String fen);

    @Query("SELECT m FROM MoveEntity m WHERE m.fen LIKE :fenPart%")
    List<MoveEntity> findByFenStartingWith(@Param("fenPart") String fenPart);
}