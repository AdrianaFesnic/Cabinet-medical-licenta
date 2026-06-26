package com.cabinet.cabinet_medical.repository;

import com.cabinet.cabinet_medical.entity.Medic;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface MedicRepository extends JpaRepository<Medic, Long> {
    Optional<Medic> findByUser_Id(Long userId);
    Boolean existsByCnp(String cnp);
}