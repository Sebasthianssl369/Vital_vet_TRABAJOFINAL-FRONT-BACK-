package com.vitalvet.vitalvet_backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "mascotas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Mascota {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_mascota")
    private Long idMascota;

    @Column(name = "id_cliente", nullable = false)
    private Long idCliente;

    @Column(nullable = false, length = 80)
    private String nombre;

    @Column(nullable = false, length = 50)
    private String especie;

    @Column(length = 80)
    private String raza;

    private Integer edad;

    @Column(length = 20)
    private String sexo;

    @Column(precision = 6, scale = 2)
    private BigDecimal peso;

    @Column(length = 60)
    private String color;

    @Column(name = "fecha_nacimiento")
    private LocalDate fechaNacimiento;

    @Builder.Default
    @Column(nullable = false, length = 20)
    private String estado = "Activo";

    @Column(columnDefinition = "TEXT")
    private String observaciones;
}
