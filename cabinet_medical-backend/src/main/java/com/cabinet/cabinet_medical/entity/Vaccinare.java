package com.cabinet.cabinet_medical.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "vaccinari")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Vaccinare {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "pacient_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "user", "doctor"})
    private Pacient patient;

    @Column(name = "vaccin", nullable = false)
    private String vaccine;

    @Column(name = "data_administrarii", nullable = false)
    private LocalDate administrationDate;

    @Column(name = "lot")
    private String lot;

    @Column(name = "administrat_de")
    private String administeredBy;

    @Column(name = "urmator_rapel")
    private LocalDate nextBooster;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}