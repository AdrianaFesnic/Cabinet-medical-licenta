package com.cabinet.cabinet_medical.repository;

import com.cabinet.cabinet_medical.entity.Vaccinare;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VaccinareRepository extends JpaRepository<Vaccinare, Long> {
    List<Vaccinare> findByPatientId(Long patientId);
}