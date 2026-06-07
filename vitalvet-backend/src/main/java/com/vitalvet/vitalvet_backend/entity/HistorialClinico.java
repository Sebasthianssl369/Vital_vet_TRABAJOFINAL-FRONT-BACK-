package com.vitalvet.vitalvet_backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "historial_clinico")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HistorialClinico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_historial")
    private Long idHistorial;

    @Column(name = "id_mascota", nullable = false)
    private Long idMascota;

    @Column(name = "id_veterinario", nullable = false)
    private Long idVeterinario;

    @Column(name = "id_cita")
    private Long idCita;

    @Builder.Default
    @Column(nullable = false)
    private LocalDateTime fecha = LocalDateTime.now();

    @Column(nullable = false, length = 180)
    private String motivo;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String diagnostico;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String tratamiento;

    @Column(columnDefinition = "TEXT")
    private String observaciones;
}
