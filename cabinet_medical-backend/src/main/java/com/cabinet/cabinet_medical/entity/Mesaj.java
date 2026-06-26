package com.cabinet.cabinet_medical.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "mesaje")
@Data
public class Mesaj {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "expeditor_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Utilizator expeditor;

    @ManyToOne
    @JoinColumn(name = "destinatar_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Utilizator destinatar;

    @Column(name = "continut")
    private String continut;

    @Column(name = "data_trimitere")
    private LocalDateTime dataTrimitere = LocalDateTime.now();

    @Column(name = "citit")
    private Boolean citit = false;
}