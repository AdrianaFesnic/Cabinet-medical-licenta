package com.cabinet.cabinet_medical.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class VaccinareRequest {
    private Long pacientId;
    private String vaccine;
    private LocalDate administrationDate;
    private String lot;
    private String administeredBy;
    private LocalDate nextBooster;
}