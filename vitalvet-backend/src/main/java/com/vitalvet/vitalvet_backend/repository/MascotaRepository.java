package com.vitalvet.vitalvet_backend.repository;

import com.vitalvet.vitalvet_backend.entity.Mascota;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MascotaRepository extends JpaRepository<Mascota, Long> {

    List<Mascota> findByIdCliente(Long idCliente);

    List<Mascota> findByEstado(String estado);

    List<Mascota> findByEspecie(String especie);
}
