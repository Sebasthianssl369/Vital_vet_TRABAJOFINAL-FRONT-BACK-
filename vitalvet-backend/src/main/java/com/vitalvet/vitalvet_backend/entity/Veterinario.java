package com.vitalvet.vitalvet_backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "veterinarios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Veterinario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_veterinario")
    private Long idVeterinario;

    @Column(nullable = false, length = 80)
    private String nombre;

    @Column(nullable = false, length = 80)
    private String apellido;

    @Column(nullable = false, length = 100)
    private String especialidad;

    @Column(length = 9)
    private String telefono;

    @Column(unique = true, length = 120)
    private String email;

    @Column(length = 30)
    private String cmp;

    @Column(length = 20)
    private String foto;

    @Builder.Default
    @Column(nullable = false, length = 20)
    private String estado = "Activo";

    @Builder.Default
    @Column(name = "fecha_registro", nullable = false)
    private LocalDate fechaRegistro = LocalDate.now();
}
