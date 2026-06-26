package com.cabinet.cabinet_medical.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "coduri_icd")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CodIcd {

    @Id
    @Column(name = "cod", nullable = false)
    private String code;

    @Column(name = "denumire", nullable = false)
    private String name;

    @Column(name = "categorie")
    private String category;
}