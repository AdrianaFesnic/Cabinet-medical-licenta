package com.cabinet.cabinet_medical.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "medicamente")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Medicament {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "denumire", nullable = false)
    private String name;

    @Column(name = "substanta_activa")
    private String activeSubstance;

    @Column(name = "forma")
    private String form;

    @Column(name = "concentratie")
    private String concentration;

    @Column(name = "compensat")
    private Boolean compensated = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}