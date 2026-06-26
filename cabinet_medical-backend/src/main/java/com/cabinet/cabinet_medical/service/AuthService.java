package com.cabinet.cabinet_medical.service;

import com.cabinet.cabinet_medical.dto.AuthResponse;
import com.cabinet.cabinet_medical.dto.LoginRequest;
import com.cabinet.cabinet_medical.dto.RegisterRequest;
import com.cabinet.cabinet_medical.entity.Medic;
import com.cabinet.cabinet_medical.entity.Pacient;
import com.cabinet.cabinet_medical.entity.Utilizator;
import com.cabinet.cabinet_medical.repository.MedicRepository;
import com.cabinet.cabinet_medical.repository.PacientRepository;
import com.cabinet.cabinet_medical.repository.UtilizatorRepository;
import com.cabinet.cabinet_medical.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UtilizatorRepository utilizatorRepository;
    private final PacientRepository pacientRepository;
    private final MedicRepository medicRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse login(LoginRequest request) {
        Utilizator user = utilizatorRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }
        if (!user.getActive()) {
            throw new RuntimeException("Account is inactive");
        }

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole());
        return new AuthResponse(token, user.getRole(), user.getUsername());
    }

    @Transactional
    public AuthResponse registerPatient(RegisterRequest request) {
        if (utilizatorRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (utilizatorRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        if (pacientRepository.existsByCnp(request.getCnp())) {
            throw new RuntimeException("CNP already exists");
        }

        Utilizator user = new Utilizator();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setRole("pacient");
        utilizatorRepository.save(user);

        Pacient patient = new Pacient();
        patient.setUser(user);
        patient.setFirstName(request.getFirstName());
        patient.setLastName(request.getLastName());
        patient.setCnp(request.getCnp());
        patient.setPhone(request.getPhone());
        pacientRepository.save(patient);

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole());
        return new AuthResponse(token, user.getRole(), user.getUsername());
    }

    @Transactional
    public AuthResponse registerDoctor(RegisterRequest request) {
        if (utilizatorRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (utilizatorRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        if (medicRepository.existsByCnp(request.getCnp())) {
            throw new RuntimeException("CNP already exists");
        }

        Utilizator user = new Utilizator();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setRole("medic");
        utilizatorRepository.save(user);

        Medic doctor = new Medic();
        doctor.setUser(user);
        doctor.setFirstName(request.getFirstName());
        doctor.setLastName(request.getLastName());
        doctor.setCnp(request.getCnp());
        doctor.setPhone(request.getPhone());
        medicRepository.save(doctor);

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole());
        return new AuthResponse(token, user.getRole(), user.getUsername());
    }
}