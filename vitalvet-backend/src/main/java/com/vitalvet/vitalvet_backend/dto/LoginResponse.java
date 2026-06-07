package com.vitalvet.vitalvet_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class LoginResponse {

    private Long idUsuario;
    private Long idCliente;
    private String username;
    private String nombre;
    private String apellido;
    private String email;
    private String rol;
    private String token;
}