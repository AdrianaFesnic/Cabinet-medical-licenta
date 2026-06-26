package com.cabinet.cabinet_medical.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ProgramareRequest {
    private Long medicId;
    private LocalDateTime appointmentDate;
    private String reason;
}