package com.cabinet.cabinet_medical.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class RetetaRequest {
    private Long pacientId;
    private Long consultatieId;
    private String type;
    private String series;
    private String number;
    private LocalDate issueDate;
    private LocalDate expiryDate;
    private String notes;
}