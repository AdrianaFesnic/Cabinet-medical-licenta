package com.cabinet.cabinet_medical.repository;

import com.cabinet.cabinet_medical.entity.Mesaj;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface MesajRepository extends JpaRepository<Mesaj, Long> {

    @Query("SELECT m FROM Mesaj m WHERE m.expeditor.id = :userId OR m.destinatar.id = :userId ORDER BY m.dataTrimitere DESC")
    List<Mesaj> findConversatiiByUserId(@Param("userId") Long userId);

    @Query("SELECT m FROM Mesaj m WHERE (m.expeditor.id = :user1 AND m.destinatar.id = :user2) OR (m.expeditor.id = :user2 AND m.destinatar.id = :user1) ORDER BY m.dataTrimitere ASC")
    List<Mesaj> findConversatieBetween(@Param("user1") Long user1, @Param("user2") Long user2);

    Long countByDestinatarIdAndCititFalse(Long destinatarId);
}