package com.vitalvet.vitalvet_backend.repository;

import com.vitalvet.vitalvet_backend.entity.Veterinario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VeterinarioRepository extends JpaRepository<Veterinario, Long> {

    List<Veterinario> findByEstado(String estado);

    Optional<Veterinario> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByCmp(String cmp);
}
