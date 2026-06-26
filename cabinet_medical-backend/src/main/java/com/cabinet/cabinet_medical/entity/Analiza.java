package com.cabinet.cabinet_medical.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "analize")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Analiza {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "consultatie_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Consultatie consultation;

    @ManyToOne
    @JoinColumn(name = "pacient_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "user", "doctor"})
    private Pacient patient;

    @Column(name = "tip_analiza", nullable = false)
    private String analysisType;

    @Column(name = "laboratory")
    private String laboratory;

    @Column(name = "collection_date")
    private LocalDate collectionDate;

    @Column(name = "result_date")
    private LocalDate resultDate;

    @Column(name = "rezultat")
    private String result;

    @Column(name = "normal_values")
    private String normalValues;

    @Column(name = "status")
    private String status = "in_asteptare";

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}