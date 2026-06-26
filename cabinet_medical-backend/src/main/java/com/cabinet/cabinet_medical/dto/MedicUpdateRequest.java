package com.cabinet.cabinet_medical.dto;

import lombok.Data;

@Data
public class MedicUpdateRequest {
    private String firstName;
    private String lastName;
    private String specialization;
    private String phone;
    private String stamp;
}