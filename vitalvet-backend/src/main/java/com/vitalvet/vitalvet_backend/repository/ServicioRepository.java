package com.vitalvet.vitalvet_backend.repository;

import com.vitalvet.vitalvet_backend.entity.Servicio;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ServicioRepository extends JpaRepository<Servicio, Long> {

    List<Servicio> findByEstado(String estado);

    Optional<Servicio> findByNombre(String nombre);

    boolean existsByNombre(String nombre);
}
