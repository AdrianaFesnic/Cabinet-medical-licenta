package com.cabinet.cabinet_medical.controller;

import com.cabinet.cabinet_medical.dto.PacientUpdateRequest;
import com.cabinet.cabinet_medical.dto.ProgramareRequest;
import com.cabinet.cabinet_medical.entity.*;
import com.cabinet.cabinet_medical.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/pacient")
@RequiredArgsConstructor
public class PacientController {

    private final PacientRepository pacientRepository;
    private final ProgramareRepository programareRepository;
    private final ConsultatieRepository consultatieRepository;
    private final RetetaRepository retetaRepository;
    private final AnalizaRepository analizaRepository;
    private final UtilizatorRepository utilizatorRepository;
    private final MedicRepository medicRepository;
    private final VaccinareRepository vaccinareRepository;

    private Pacient getPacientFromAuth(Authentication auth) {
        String username = auth.getName();
        Utilizator user = utilizatorRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return pacientRepository.findByUser_Id(user.getId())
                .orElseThrow(() -> new RuntimeException("Pacient not found"));
    }

    @GetMapping("/profil")
    public ResponseEntity<Pacient> getProfil(Authentication auth) {
        return ResponseEntity.ok(getPacientFromAuth(auth));
    }

    @PutMapping("/profil")
    public ResponseEntity<Pacient> updateProfil(
            @RequestBody PacientUpdateRequest request,
            Authentication auth) {
        Pacient pacient = getPacientFromAuth(auth);
        pacient.setPhone(request.getPhone());
        pacient.setEmail(request.getEmail());
        pacient.setAddress(request.getAddress());
        pacient.setBloodType(request.getBloodType());
        pacient.setRh(request.getRh());
        pacient.setAllergies(request.getAllergies());
        pacientRepository.save(pacient);
        return ResponseEntity.ok(pacient);
    }

    @GetMapping("/medici")
    public ResponseEntity<List<Medic>> getMedici() {
        return ResponseEntity.ok(medicRepository.findAll());
    }

    @GetMapping("/programari")
    public ResponseEntity<List<Programare>> getProgramari(Authentication auth) {
        Pacient pacient = getPacientFromAuth(auth);
        return ResponseEntity.ok(programareRepository.findByPatientId(pacient.getId()));
    }

    @GetMapping("/ore-disponibile")
    public ResponseEntity<List<String>> getOreDisponibile(
            @RequestParam Long medicId,
            @RequestParam String data) {

        LocalDate ziua = LocalDate.parse(data);

        List<Programare> programariExistente = programareRepository.findByDoctorAndDate(medicId, ziua);

        Set<String> oreOcupate = programariExistente.stream()
                .map(p -> p.getAppointmentDate().toLocalTime().toString())
                .collect(Collectors.toSet());

        List<String> oreDisponibile = new ArrayList<>();
        LocalTime ora = LocalTime.of(8, 0);
        LocalTime oraFinal = LocalTime.of(16, 0);

        while (ora.isBefore(oraFinal)) {
            String oraStr = ora.toString();
            if (!oreOcupate.contains(oraStr) && !oreOcupate.contains(oraStr + ":00")) {
                oreDisponibile.add(oraStr);
            }
            ora = ora.plusMinutes(30);
        }

        return ResponseEntity.ok(oreDisponibile);
    }

    @PostMapping("/programari")
    public ResponseEntity<?> addProgramare(
            @RequestBody ProgramareRequest request,
            Authentication auth) {
        Pacient pacient = getPacientFromAuth(auth);
        Medic medic = medicRepository.findById(request.getMedicId())
                .orElseThrow(() -> new RuntimeException("Medic not found"));

        LocalDateTime dataOra = request.getAppointmentDate();
        LocalDate ziua = dataOra.toLocalDate();

        List<Programare> programariExistente = programareRepository.findByDoctorAndDate(medic.getId(), ziua);
        boolean ocupat = programariExistente.stream()
                .anyMatch(p -> p.getAppointmentDate().toLocalTime().equals(dataOra.toLocalTime()));

        if (ocupat) {
            return ResponseEntity.badRequest().body("Ora selectată este deja ocupată pentru acest medic. Vă rugăm alegeți altă oră.");
        }

        Programare programare = new Programare();
        programare.setPatient(pacient);
        programare.setDoctor(medic);
        programare.setAppointmentDate(dataOra);
        programare.setReason(request.getReason());
        programare.setStatus("asteptare");
        programareRepository.save(programare);
        return ResponseEntity.ok(programare);
    }

    @PutMapping("/programari/{id}/anuleaza")
    public ResponseEntity<Programare> anuleazaProgramare(
            @PathVariable Long id,
            Authentication auth) {
        Pacient pacient = getPacientFromAuth(auth);
        Programare programare = programareRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Programare not found"));

        if (!programare.getPatient().getId().equals(pacient.getId())) {
            throw new RuntimeException("Not authorized");
        }

        if (programare.getStatus().equals("finalizata")) {
            throw new RuntimeException("Cannot cancel finalized appointment");
        }

        programare.setStatus("anulata");
        programareRepository.save(programare);
        return ResponseEntity.ok(programare);
    }

    @GetMapping("/consultatii")
    public ResponseEntity<List<Consultatie>> getConsultatii(Authentication auth) {
        Pacient pacient = getPacientFromAuth(auth);
        return ResponseEntity.ok(consultatieRepository.findByPatientId(pacient.getId()));
    }

    @GetMapping("/retete")
    public ResponseEntity<List<Reteta>> getRetete(Authentication auth) {
        Pacient pacient = getPacientFromAuth(auth);
        return ResponseEntity.ok(retetaRepository.findByPatientId(pacient.getId()));
    }

    @GetMapping("/analize")
    public ResponseEntity<List<Analiza>> getAnalize(Authentication auth) {
        Pacient pacient = getPacientFromAuth(auth);
        return ResponseEntity.ok(analizaRepository.findByPatientId(pacient.getId()));
    }

    @GetMapping("/vaccinari")
    public ResponseEntity<List<Vaccinare>> getVaccinari(Authentication auth) {
        Pacient pacient = getPacientFromAuth(auth);
        return ResponseEntity.ok(vaccinareRepository.findByPatientId(pacient.getId()));
    }
}