package com.cabinet.cabinet_medical.dto;

import lombok.Data;

@Data
public class ConsultatieRequest {
    private Long pacientId;
    private Long programareId;
    private String symptoms;
    private String diagnosis;
    private String treatment;
    private String notes;
}