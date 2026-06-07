package com.vitalvet.vitalvet_backend.repository;

import com.vitalvet.vitalvet_backend.entity.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    Optional<Cliente> findByDni(String dni);

    Optional<Cliente> findByEmail(String email);

    boolean existsByDni(String dni);

    boolean existsByEmail(String email);

    List<Cliente> findByEstado(String estado);
}
