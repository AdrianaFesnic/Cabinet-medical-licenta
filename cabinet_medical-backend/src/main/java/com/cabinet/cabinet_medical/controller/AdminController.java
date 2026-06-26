package com.cabinet.cabinet_medical.controller;

import com.cabinet.cabinet_medical.dto.RegisterRequest;
import com.cabinet.cabinet_medical.dto.AuthResponse;
import com.cabinet.cabinet_medical.dto.MedicUpdateRequest;
import com.cabinet.cabinet_medical.entity.Medic;
import com.cabinet.cabinet_medical.entity.Programare;
import com.cabinet.cabinet_medical.entity.Utilizator;
import com.cabinet.cabinet_medical.repository.*;
import com.cabinet.cabinet_medical.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UtilizatorRepository utilizatorRepository;
    private final MedicRepository medicRepository;
    private final PacientRepository pacientRepository;
    private final ProgramareRepository programareRepository;
    private final ConsultatieRepository consultatieRepository;
    private final AuthService authService;

    @GetMapping("/utilizatori")
    public ResponseEntity<List<Utilizator>> getAllUsers() {
        return ResponseEntity.ok(utilizatorRepository.findAll());
    }

    @PostMapping("/register/doctor")
    public ResponseEntity<AuthResponse> registerDoctor(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.registerDoctor(request));
    }

    @PutMapping("/utilizatori/{id}/toggle")
    public ResponseEntity<Utilizator> toggleUser(@PathVariable Long id) {
        Utilizator user = utilizatorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(!user.getActive());
        utilizatorRepository.save(user);
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/utilizatori/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        utilizatorRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/medici")
    public ResponseEntity<List<Medic>> getAllMedici() {
        return ResponseEntity.ok(medicRepository.findAll());
    }

    @PutMapping("/medici/{id}")
    public ResponseEntity<Medic> updateMedic(
            @PathVariable Long id,
            @RequestBody MedicUpdateRequest request) {
        Medic medic = medicRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medic not found"));
        medic.setFirstName(request.getFirstName());
        medic.setLastName(request.getLastName());
        medic.setSpecialization(request.getSpecialization());
        medic.setPhone(request.getPhone());
        medic.setStamp(request.getStamp());
        medicRepository.save(medic);
        return ResponseEntity.ok(medic);
    }

    @GetMapping("/statistici")
    public ResponseEntity<Map<String, Object>> getStatistici() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalPacienti", pacientRepository.count());
        stats.put("totalMedici", medicRepository.count());
        stats.put("totalProgramari", programareRepository.count());
        stats.put("totalConsultatii", consultatieRepository.count());

        List<Object[]> statusStats = programareRepository.countByStatus();
        Map<String, Long> programariStatus = new HashMap<>();
        for (Object[] row : statusStats) {
            programariStatus.put((String) row[0], (Long) row[1]);
        }
        stats.put("programariStatus", programariStatus);

        List<Object[]> lunaStats = programareRepository.countByMonth();
        Map<String, Long> programariLuna = new HashMap<>();
        for (Object[] row : lunaStats) {
            programariLuna.put(String.valueOf(row[0]), (Long) row[1]);
        }
        stats.put("programariLuna", programariLuna);

        List<Object[]> topMedici = consultatieRepository.topMediciByConsultatii();
        stats.put("topMedici", topMedici.stream().map(row -> {
            Map<String, Object> m = new HashMap<>();
            m.put("nume", row[0] + " " + row[1]);
            m.put("total", row[2]);
            return m;
        }).toList());

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/programari/zi")
    public ResponseEntity<Map<String, Object>> getProgramariByZi(@RequestParam String data) {
        LocalDate localDate = LocalDate.parse(data);
        List<Programare> programari = programareRepository.findByDate(localDate);

        Map<String, Object> result = new HashMap<>();
        result.put("data", data);
        result.put("total", programari.size());
        result.put("programari", programari.stream().map(p -> {
            Map<String, Object> prog = new HashMap<>();
            prog.put("pacient", p.getPatient() != null ? p.getPatient().getFirstName() + " " + p.getPatient().getLastName() : "-");
            prog.put("medic", p.getDoctor() != null ? "Dr. " + p.getDoctor().getFirstName() + " " + p.getDoctor().getLastName() : "-");
            prog.put("motiv", p.getReason());
            prog.put("status", p.getStatus());
            return prog;
        }).toList());

        return ResponseEntity.ok(result);
    }
}