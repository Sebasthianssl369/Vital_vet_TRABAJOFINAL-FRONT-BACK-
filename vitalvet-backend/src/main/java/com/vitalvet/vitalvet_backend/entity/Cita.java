package com.vitalvet.vitalvet_backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "citas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cita {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cita")
    private Long idCita;

    @Column(name = "id_cliente", nullable = false)
    private Long idCliente;

    @Column(name = "id_mascota", nullable = false)
    private Long idMascota;

    @Column(name = "id_veterinario", nullable = false)
    private Long idVeterinario;

    @Column(name = "id_servicio", nullable = false)
    private Long idServicio;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(nullable = false)
    private LocalTime hora;

    @Builder.Default
    @Column(nullable = false, length = 30)
    private String estado = "Pendiente";

    @Builder.Default
    @Column(name = "estado_pago", nullable = false, length = 30)
    private String estadoPago = "pendiente";

    @Builder.Default
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal monto = BigDecimal.ZERO;

    @Column(columnDefinition = "TEXT")
    private String motivo;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @Builder.Default
    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();
}