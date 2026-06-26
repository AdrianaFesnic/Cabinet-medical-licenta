package com.cabinet.cabinet_medical.repository;

import com.cabinet.cabinet_medical.entity.Consultatie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface ConsultatieRepository extends JpaRepository<Consultatie, Long> {
    List<Consultatie> findByPatientId(Long patientId);
    List<Consultatie> findByDoctorId(Long doctorId);

    @Query("SELECT m.firstName, m.lastName, COUNT(c) FROM Consultatie c JOIN c.doctor m GROUP BY m.id, m.firstName, m.lastName ORDER BY COUNT(c) DESC")
    List<Object[]> topMediciByConsultatii();
}