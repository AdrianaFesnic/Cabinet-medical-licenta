package com.cabinet.cabinet_medical.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Username-ul este obligatoriu")
    @Size(min = 3, message = "Username-ul trebuie să aibă minim 3 caractere")
    private String username;

    @NotBlank(message = "Parola este obligatorie")
    @Size(min = 6, message = "Parola trebuie să aibă minim 6 caractere")
    private String password;

    @NotBlank(message = "Email-ul este obligatoriu")
    @Email(message = "Adresă de email invalidă")
    private String email;

    @NotBlank(message = "Prenumele este obligatoriu")
    @Size(min = 2, message = "Prenumele trebuie să aibă minim 2 caractere")
    private String firstName;

    @NotBlank(message = "Numele este obligatoriu")
    @Size(min = 2, message = "Numele trebuie să aibă minim 2 caractere")
    private String lastName;

    @NotBlank(message = "CNP-ul este obligatoriu")
    @Pattern(regexp = "^\\d{13}$", message = "CNP-ul trebuie să aibă exact 13 cifre")
    private String cnp;

    @NotBlank(message = "Telefonul este obligatoriu")
    @Pattern(regexp = "^(07\\d{8}|\\+407\\d{8})$", message = "Telefon invalid (ex: 0721234567 sau +40721234567)")
    private String phone;
}