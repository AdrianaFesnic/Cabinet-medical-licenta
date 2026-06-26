package com.cabinet.cabinet_medical.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class AnalizaRequest {
    private Long pacientId;
    private String analysisType;
    private String laboratory;
    private LocalDate collectionDate;
}