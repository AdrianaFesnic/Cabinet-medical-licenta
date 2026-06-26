package com.cabinet.cabinet_medical.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "pacienti")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Pacient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "utilizator_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private Utilizator user;

    @Column(unique = true, nullable = false)
    private String cnp;

    @Column(name = "prenume", nullable = false)
    private String firstName;

    @Column(name = "nume", nullable = false)
    private String lastName;

    @Column(name = "data_nasterii")
    private LocalDate dateOfBirth;

    @Column(name = "sex")
    private String sex;

    @Column(name = "telefon")
    private String phone;

    @Column(name = "email")
    private String email;

    @Column(name = "adresa")
    private String address;

    @Column(name = "grup_sanguin")
    private String bloodType;

    @Column(name = "rh")
    private String rh;

    @Column(name = "alergii")
    private String allergies;

    @ManyToOne
    @JoinColumn(name = "medic_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "user"})
    private Medic doctor;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
}