package com.vitalvet.vitalvet_backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "clientes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cliente")
    private Long idCliente;

    @Column(name = "id_usuario")
    private Long idUsuario;

    @Column(nullable = false, length = 80)
    private String nombre;

    @Column(nullable = false, length = 80)
    private String apellido;

    @Column(nullable = false, unique = true, length = 8)
    private String dni;

    @Column(length = 9)
    private String telefono;

    @Column(unique = true, length = 120)
    private String email;

    @Column(length = 180)
    private String direccion;

    @Builder.Default
    @Column(nullable = false, length = 20)
    private String estado = "Activo";

    @Builder.Default
    @Column(name = "fecha_registro", nullable = false)
    private LocalDate fechaRegistro = LocalDate.now();
}
