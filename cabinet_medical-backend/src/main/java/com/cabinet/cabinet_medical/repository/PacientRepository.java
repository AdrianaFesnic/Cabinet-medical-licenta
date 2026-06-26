package com.cabinet.cabinet_medical.repository;

import com.cabinet.cabinet_medical.entity.Pacient;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PacientRepository extends JpaRepository<Pacient, Long> {
    Optional<Pacient> findByCnp(String cnp);
    Optional<Pacient> findByUser_Id(Long userId);
    List<Pacient> findByDoctorId(Long doctorId);
    Boolean existsByCnp(String cnp);
}