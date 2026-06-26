package com.cabinet.cabinet_medical.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String username;
    private String password;
}