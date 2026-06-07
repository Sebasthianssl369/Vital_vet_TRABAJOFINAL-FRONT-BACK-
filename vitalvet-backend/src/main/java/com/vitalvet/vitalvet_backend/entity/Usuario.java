package com.vitalvet.vitalvet_backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "usuarios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idUsuario;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false, length = 120)
    private String password;

    @Column(nullable = false, length = 30)
    private String rol;

    @Column(length = 80)
    private String nombre;

    @Column(length = 80)
    private String apellido;

    @Column(length = 8)
    private String dni;

    @Column(length = 9)
    private String telefono;

    @Column(length = 120)
    private String email;

    private Long idCliente;

    @Builder.Default
    @Column(nullable = false)
    private Boolean activo = true;
}
