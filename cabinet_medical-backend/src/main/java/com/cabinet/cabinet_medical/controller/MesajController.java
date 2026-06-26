package com.cabinet.cabinet_medical.controller;

import com.cabinet.cabinet_medical.dto.MesajRequest;
import com.cabinet.cabinet_medical.entity.Mesaj;
import com.cabinet.cabinet_medical.entity.Utilizator;
import com.cabinet.cabinet_medical.repository.MesajRepository;
import com.cabinet.cabinet_medical.repository.UtilizatorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/mesaje")
@RequiredArgsConstructor
public class MesajController {

    private final MesajRepository mesajRepository;
    private final UtilizatorRepository utilizatorRepository;

    private Utilizator getUserFromAuth(Authentication auth) {
        return utilizatorRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping("/inbox")
    public ResponseEntity<List<Mesaj>> getInbox(Authentication auth) {
        Utilizator user = getUserFromAuth(auth);
        return ResponseEntity.ok(mesajRepository.findConversatiiByUserId(user.getId()));
    }

    @GetMapping("/conversatie/{userId}")
    public ResponseEntity<List<Mesaj>> getConversatie(
            @PathVariable Long userId,
            Authentication auth) {
        Utilizator user = getUserFromAuth(auth);
        List<Mesaj> mesaje = mesajRepository.findConversatieBetween(user.getId(), userId);
        mesaje.stream()
                .filter(m -> m.getDestinatar().getId().equals(user.getId()) && !m.getCitit())
                .forEach(m -> {
                    m.setCitit(true);
                    mesajRepository.save(m);
                });
        return ResponseEntity.ok(mesaje);
    }

    @PostMapping("/trimite")
    public ResponseEntity<Mesaj> trimite(
            @RequestBody MesajRequest request,
            Authentication auth) {
        Utilizator expeditor = getUserFromAuth(auth);
        Utilizator destinatar = utilizatorRepository.findById(request.getDestinatarId())
                .orElseThrow(() -> new RuntimeException("Destinatar not found"));
        Mesaj mesaj = new Mesaj();
        mesaj.setExpeditor(expeditor);
        mesaj.setDestinatar(destinatar);
        mesaj.setContinut(request.getContinut());
        mesajRepository.save(mesaj);
        return ResponseEntity.ok(mesaj);
    }

    @GetMapping("/necitite")
    public ResponseEntity<Map<String, Long>> getNecitite(Authentication auth) {
        Utilizator user = getUserFromAuth(auth);
        Long count = mesajRepository.countByDestinatarIdAndCititFalse(user.getId());
        Map<String, Long> result = new HashMap<>();
        result.put("count", count);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/utilizatori")
    public ResponseEntity<List<Utilizator>> getUtilizatori(Authentication auth) {
        Utilizator current = getUserFromAuth(auth);
        List<Utilizator> toti = utilizatorRepository.findAll();

        if (current.getRole().equals("pacient")) {
            toti.removeIf(u -> !u.getRole().equals("medic"));
        } else {
            toti.removeIf(u -> u.getId().equals(current.getId()));
        }

        return ResponseEntity.ok(toti);
    }
}