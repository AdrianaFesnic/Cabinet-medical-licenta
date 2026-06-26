package com.cabinet.cabinet_medical.repository;

import com.cabinet.cabinet_medical.entity.Utilizator;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UtilizatorRepository extends JpaRepository<Utilizator, Long> {
    Optional<Utilizator> findByUsername(String username);
    Optional<Utilizator> findByEmail(String email);
    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);
}