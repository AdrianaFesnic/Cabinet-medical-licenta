package com.cabinet.cabinet_medical.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "retete")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Reteta {

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

    @ManyToOne
    @JoinColumn(name = "medic_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "user"})
    private Medic doctor;

    @Column(name = "tip")
    private String type = "simpla";

    @Column(name = "serie")
    private String series;

    @Column(name = "numar")
    private String number;

    @Column(name = "data_emiterii")
    private LocalDate issueDate = LocalDate.now();

    @Column(name = "data_expirarii")
    private LocalDate expiryDate;

    @Column(name = "observatii")
    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}