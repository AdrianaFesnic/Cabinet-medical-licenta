package com.cabinet.cabinet_medical.controller;

import com.cabinet.cabinet_medical.entity.Medic;
import com.cabinet.cabinet_medical.repository.MedicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicController {

    private final MedicRepository medicRepository;

    @GetMapping("/medici")
    public ResponseEntity<List<Medic>> getMedici() {
        return ResponseEntity.ok(medicRepository.findAll());
    }
}