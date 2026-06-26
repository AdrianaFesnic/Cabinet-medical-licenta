package com.cabinet.cabinet_medical.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "antecedente_medicale")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AntecedenteMedicale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "pacient_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "user", "doctor"})
    private Pacient patient;

    @Column(name = "tip")
    private String type;

    @Column(name = "denumire", nullable = false)
    private String name;

    @Column(name = "data_debut")
    private LocalDate startDate;

    @Column(name = "data_sfarsit")
    private LocalDate endDate;

    @Column(name = "detalii")
    private String details;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}