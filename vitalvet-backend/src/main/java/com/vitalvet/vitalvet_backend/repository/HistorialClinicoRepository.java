package com.vitalvet.vitalvet_backend.repository;

import com.vitalvet.vitalvet_backend.entity.HistorialClinico;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HistorialClinicoRepository extends JpaRepository<HistorialClinico, Long> {

    List<HistorialClinico> findByIdMascota(Long idMascota);

    List<HistorialClinico> findByIdVeterinario(Long idVeterinario);

    List<HistorialClinico> findByIdCita(Long idCita);
}
