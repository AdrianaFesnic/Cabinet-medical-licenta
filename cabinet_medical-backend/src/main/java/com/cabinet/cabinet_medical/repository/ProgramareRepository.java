package com.cabinet.cabinet_medical.repository;

import com.cabinet.cabinet_medical.entity.Programare;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface ProgramareRepository extends JpaRepository<Programare, Long> {
    List<Programare> findByDoctorId(Long doctorId);
    List<Programare> findByPatientId(Long patientId);

    @Query("SELECT p.status, COUNT(p) FROM Programare p GROUP BY p.status")
    List<Object[]> countByStatus();

    @Query("SELECT MONTH(p.appointmentDate), COUNT(p) FROM Programare p GROUP BY MONTH(p.appointmentDate) ORDER BY MONTH(p.appointmentDate)")
    List<Object[]> countByMonth();

    @Query("SELECT p FROM Programare p WHERE CAST(p.appointmentDate AS date) = :data")
    List<Programare> findByDate(@Param("data") LocalDate data);

    @Query("SELECT p FROM Programare p WHERE p.doctor.id = :medicId AND CAST(p.appointmentDate AS date) = :data AND p.status != 'anulata'")
    List<Programare> findByDoctorAndDate(@Param("medicId") Long medicId, @Param("data") LocalDate data);
}