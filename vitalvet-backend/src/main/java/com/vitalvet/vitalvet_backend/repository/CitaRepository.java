package com.vitalvet.vitalvet_backend.repository;

import com.vitalvet.vitalvet_backend.entity.Cita;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface CitaRepository extends JpaRepository<Cita, Long> {

    List<Cita> findByIdCliente(Long idCliente);

    List<Cita> findByIdMascota(Long idMascota);

    List<Cita> findByIdVeterinario(Long idVeterinario);

    List<Cita> findByFecha(LocalDate fecha);

    List<Cita> findByEstado(String estado);

    List<Cita> findByEstadoPago(String estadoPago);
}
