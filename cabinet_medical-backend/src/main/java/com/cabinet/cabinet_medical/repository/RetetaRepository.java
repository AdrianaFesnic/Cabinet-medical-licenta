package com.cabinet.cabinet_medical.repository;

import com.cabinet.cabinet_medical.entity.Reteta;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RetetaRepository extends JpaRepository<Reteta, Long> {
    List<Reteta> findByPatientId(Long patientId);
    List<Reteta> findByDoctorId(Long doctorId);
    List<Reteta> findByConsultationId(Long consultationId);
}