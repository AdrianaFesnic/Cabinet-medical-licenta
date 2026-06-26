package com.cabinet.cabinet_medical.repository;

import com.cabinet.cabinet_medical.entity.Analiza;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AnalizaRepository extends JpaRepository<Analiza, Long> {
    List<Analiza> findByPatientId(Long patientId);
    List<Analiza> findByStatus(String status);
}