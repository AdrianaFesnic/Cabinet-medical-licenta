package com.cabinet.cabinet_medical.repository;

import com.cabinet.cabinet_medical.entity.Trimitere;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TrimitereRepository extends JpaRepository<Trimitere, Long> {
    List<Trimitere> findByPatientId(Long patientId);
    List<Trimitere> findByDoctorId(Long doctorId);
}