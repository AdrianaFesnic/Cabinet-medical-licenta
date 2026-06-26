package com.cabinet.cabinet_medical.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "consultatii")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Consultatie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "programare_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "patient", "doctor"})
    private Programare appointment;

    @ManyToOne
    @JoinColumn(name = "pacient_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "user", "doctor"})
    private Pacient patient;

    @ManyToOne
    @JoinColumn(name = "medic_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "user"})
    private Medic doctor;

    @Column(name = "simptome")
    private String symptoms;

    @Column(name = "diagnostic")
    private String diagnosis;

    @ManyToOne
    @JoinColumn(name = "cod_icd")
    private CodIcd icdCode;

    @Column(name = "tratament")
    private String treatment;

    @Column(name = "observatii")
    private String notes;

    @Column(name = "data_consultatiei")
    private LocalDateTime consultationDate = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
}