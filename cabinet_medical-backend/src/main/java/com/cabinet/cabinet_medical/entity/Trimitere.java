package com.cabinet.cabinet_medical.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "trimiteri")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Trimitere {

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

    @Column(name = "specialitate", nullable = false)
    private String speciality;

    @Column(name = "unitate_medicala")
    private String medicalUnit;

    @Column(name = "motiv_trimitere")
    private String referralReason;

    @Column(name = "data_emiterii")
    private LocalDate issueDate = LocalDate.now();

    @Column(name = "data_valabilitatii")
    private LocalDate validityDate;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}