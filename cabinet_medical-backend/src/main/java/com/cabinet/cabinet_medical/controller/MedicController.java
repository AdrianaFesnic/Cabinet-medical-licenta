package com.cabinet.cabinet_medical.controller;

import com.cabinet.cabinet_medical.dto.AnalizaRequest;
import com.cabinet.cabinet_medical.dto.ConsultatieRequest;
import com.cabinet.cabinet_medical.dto.MedicUpdateRequest;
import com.cabinet.cabinet_medical.dto.RetetaRequest;
import com.cabinet.cabinet_medical.dto.VaccinareRequest;
import com.cabinet.cabinet_medical.entity.*;
import com.cabinet.cabinet_medical.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/medic")
@RequiredArgsConstructor
public class MedicController {

    private final MedicRepository medicRepository;
    private final PacientRepository pacientRepository;
    private final ProgramareRepository programareRepository;
    private final ConsultatieRepository consultatieRepository;
    private final UtilizatorRepository utilizatorRepository;
    private final AnalizaRepository analizaRepository;
    private final RetetaRepository retetaRepository;
    private final VaccinareRepository vaccinareRepository;

    private Medic getMedicFromAuth(Authentication auth) {
        String username = auth.getName();
        Utilizator user = utilizatorRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return medicRepository.findByUser_Id(user.getId())
                .orElseThrow(() -> new RuntimeException("Medic not found"));
    }

    @GetMapping("/profil")
    public ResponseEntity<Medic> getProfil(Authentication auth) {
        return ResponseEntity.ok(getMedicFromAuth(auth));
    }

    @PutMapping("/profil")
    public ResponseEntity<Medic> updateProfil(
            @RequestBody MedicUpdateRequest request,
            Authentication auth) {
        Medic medic = getMedicFromAuth(auth);
        medic.setFirstName(request.getFirstName());
        medic.setLastName(request.getLastName());
        medic.setSpecialization(request.getSpecialization());
        medic.setPhone(request.getPhone());
        medic.setStamp(request.getStamp());
        medicRepository.save(medic);
        return ResponseEntity.ok(medic);
    }

    @GetMapping("/pacienti")
    public ResponseEntity<List<Pacient>> getPacienti(Authentication auth) {
        return ResponseEntity.ok(pacientRepository.findAll());
    }

    @GetMapping("/programari")
    public ResponseEntity<List<Programare>> getProgramari(Authentication auth) {
        Medic medic = getMedicFromAuth(auth);
        return ResponseEntity.ok(programareRepository.findByDoctorId(medic.getId()));
    }

    @PutMapping("/programari/{id}/status")
    public ResponseEntity<Programare> updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            Authentication auth) {
        Medic medic = getMedicFromAuth(auth);
        Programare programare = programareRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Programare not found"));

        if (!programare.getDoctor().getId().equals(medic.getId())) {
            throw new RuntimeException("Not authorized");
        }

        programare.setStatus(status);
        programareRepository.save(programare);
        return ResponseEntity.ok(programare);
    }

    @GetMapping("/consultatii")
    public ResponseEntity<List<Consultatie>> getConsultatii(Authentication auth) {
        Medic medic = getMedicFromAuth(auth);
        return ResponseEntity.ok(consultatieRepository.findByDoctorId(medic.getId()));
    }

    @PostMapping("/consultatii")
    public ResponseEntity<Consultatie> addConsultatie(
            @RequestBody ConsultatieRequest request,
            Authentication auth) {
        Medic medic = getMedicFromAuth(auth);
        Pacient pacient = pacientRepository.findById(request.getPacientId())
                .orElseThrow(() -> new RuntimeException("Pacient not found"));

        Consultatie consultatie = new Consultatie();
        consultatie.setDoctor(medic);
        consultatie.setPatient(pacient);
        consultatie.setSymptoms(request.getSymptoms());
        consultatie.setDiagnosis(request.getDiagnosis());
        consultatie.setTreatment(request.getTreatment());
        consultatie.setNotes(request.getNotes());

        if (request.getProgramareId() != null) {
            Programare programare = programareRepository.findById(request.getProgramareId())
                    .orElse(null);
            if (programare != null) {
                consultatie.setAppointment(programare);
                programare.setStatus("finalizata");
                programareRepository.save(programare);
            }
        }

        consultatieRepository.save(consultatie);
        return ResponseEntity.ok(consultatie);
    }

    @PutMapping("/consultatii/{id}")
    public ResponseEntity<Consultatie> updateConsultatie(
            @PathVariable Long id,
            @RequestBody ConsultatieRequest request,
            Authentication auth) {
        Consultatie consultatie = consultatieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Consultatie not found"));
        if (request.getSymptoms() != null) consultatie.setSymptoms(request.getSymptoms());
        if (request.getDiagnosis() != null) consultatie.setDiagnosis(request.getDiagnosis());
        if (request.getTreatment() != null) consultatie.setTreatment(request.getTreatment());
        if (request.getNotes() != null) consultatie.setNotes(request.getNotes());
        consultatieRepository.save(consultatie);
        return ResponseEntity.ok(consultatie);
    }

    @PostMapping("/retete")
    public ResponseEntity<Reteta> addReteta(
            @RequestBody RetetaRequest request,
            Authentication auth) {
        Medic medic = getMedicFromAuth(auth);
        Pacient pacient = pacientRepository.findById(request.getPacientId())
                .orElseThrow(() -> new RuntimeException("Pacient not found"));

        Reteta reteta = new Reteta();
        reteta.setDoctor(medic);
        reteta.setPatient(pacient);
        reteta.setType(request.getType());
        reteta.setSeries(request.getSeries());
        reteta.setNumber(request.getNumber());
        reteta.setIssueDate(request.getIssueDate() != null ? request.getIssueDate() : java.time.LocalDate.now());
        reteta.setExpiryDate(request.getExpiryDate());
        reteta.setNotes(request.getNotes());

        if (request.getConsultatieId() != null) {
            consultatieRepository.findById(request.getConsultatieId())
                    .ifPresent(reteta::setConsultation);
        }

        retetaRepository.save(reteta);
        return ResponseEntity.ok(reteta);
    }

    @GetMapping("/retete")
    public ResponseEntity<List<Reteta>> getRetete(Authentication auth) {
        Medic medic = getMedicFromAuth(auth);
        return ResponseEntity.ok(retetaRepository.findByDoctorId(medic.getId()));
    }

    @PostMapping("/analize")
    public ResponseEntity<Analiza> addAnaliza(
            @RequestBody AnalizaRequest request,
            Authentication auth) {
        Medic medic = getMedicFromAuth(auth);
        Pacient pacient = pacientRepository.findById(request.getPacientId())
                .orElseThrow(() -> new RuntimeException("Pacient not found"));

        Analiza analiza = new Analiza();
        analiza.setPatient(pacient);
        analiza.setAnalysisType(request.getAnalysisType());
        analiza.setLaboratory(request.getLaboratory());
        analiza.setCollectionDate(request.getCollectionDate());
        analiza.setStatus("in_asteptare");

        analizaRepository.save(analiza);
        return ResponseEntity.ok(analiza);
    }

    @GetMapping("/analize")
    public ResponseEntity<List<Analiza>> getAnalize(Authentication auth) {
        return ResponseEntity.ok(analizaRepository.findAll());
    }

    @PutMapping("/analize/{id}/rezultat")
    public ResponseEntity<Analiza> addRezultat(
            @PathVariable Long id,
            @RequestParam String rezultat,
            Authentication auth) {
        Analiza analiza = analizaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Analiza not found"));
        analiza.setResult(rezultat);
        analiza.setStatus("finalizat");
        analiza.setResultDate(java.time.LocalDate.now());
        analizaRepository.save(analiza);
        return ResponseEntity.ok(analiza);
    }

    @PostMapping("/vaccinari")
    public ResponseEntity<Vaccinare> addVaccinare(
            @RequestBody VaccinareRequest request,
            Authentication auth) {
        Medic medic = getMedicFromAuth(auth);
        Pacient pacient = pacientRepository.findById(request.getPacientId())
                .orElseThrow(() -> new RuntimeException("Pacient not found"));

        Vaccinare vaccinare = new Vaccinare();
        vaccinare.setPatient(pacient);
        vaccinare.setVaccine(request.getVaccine());
        vaccinare.setAdministrationDate(request.getAdministrationDate() != null ? request.getAdministrationDate() : java.time.LocalDate.now());
        vaccinare.setLot(request.getLot());
        vaccinare.setAdministeredBy(
                request.getAdministeredBy() != null && !request.getAdministeredBy().isBlank()
                        ? request.getAdministeredBy()
                        : "Dr. " + medic.getFirstName() + " " + medic.getLastName()
        );
        vaccinare.setNextBooster(request.getNextBooster());

        vaccinareRepository.save(vaccinare);
        return ResponseEntity.ok(vaccinare);
    }

    @GetMapping("/vaccinari")
    public ResponseEntity<List<Vaccinare>> getVaccinari(Authentication auth) {
        return ResponseEntity.ok(vaccinareRepository.findAll());
    }
}