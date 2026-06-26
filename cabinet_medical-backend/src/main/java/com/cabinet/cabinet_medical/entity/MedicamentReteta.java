package com.cabinet.cabinet_medical.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "medicamente_reteta")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MedicamentReteta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "reteta_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Reteta prescription;

    @ManyToOne
    @JoinColumn(name = "medicament_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Medicament medication;

    @Column(name = "doza")
    private String dose;

    @Column(name = "frecventa")
    private String frequency;

    @Column(name = "durata_zile")
    private Integer durationDays;

    @Column(name = "cantitate")
    private Integer quantity = 1;

    @Column(name = "instructiuni")
    private String instructions;
}