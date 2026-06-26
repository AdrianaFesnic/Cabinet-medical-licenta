package com.cabinet.cabinet_medical.repository;

import com.cabinet.cabinet_medical.entity.Medicament;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MedicamentRepository extends JpaRepository<Medicament, Long> {
    List<Medicament> findByCompensatedTrue();
    List<Medicament> findByNameContainingIgnoreCase(String name);
}