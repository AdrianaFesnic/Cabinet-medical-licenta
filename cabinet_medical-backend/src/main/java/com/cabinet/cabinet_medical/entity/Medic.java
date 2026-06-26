package com.cabinet.cabinet_medical.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "medici")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Medic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "utilizator_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password", "parolaHash"})
    private Utilizator user;

    @Column(name = "prenume", nullable = false)
    private String firstName;

    @Column(name = "nume", nullable = false)
    private String lastName;

    @Column(unique = true, nullable = false)
    private String cnp;

    @Column(name = "specializare")
    private String specialization;

    @Column(name = "telefon")
    private String phone;

    @Column(name = "parafa", unique = true)
    private String stamp;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
}