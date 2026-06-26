package com.cabinet.cabinet_medical.dto;

import lombok.Data;

@Data
public class PacientUpdateRequest {
    private String phone;
    private String email;
    private String address;
    private String bloodType;
    private String rh;
    private String allergies;
}