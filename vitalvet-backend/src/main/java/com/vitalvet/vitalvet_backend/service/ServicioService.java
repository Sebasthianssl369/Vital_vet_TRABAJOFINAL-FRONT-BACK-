package com.vitalvet.vitalvet_backend.service;

import com.vitalvet.vitalvet_backend.entity.Servicio;
import com.vitalvet.vitalvet_backend.repository.ServicioRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ServicioService {

    private final ServicioRepository servicioRepository;

    public ServicioService(ServicioRepository servicioRepository) {
        this.servicioRepository = servicioRepository;
    }

    public List<Servicio> listarTodos() {
        return servicioRepository.findAll();
    }

    public List<Servicio> listarActivos() {
        return servicioRepository.findByEstado("Activo");
    }

    public Servicio obtenerPorId(Long id) {
        return servicioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Servicio no encontrado"));
    }

    public Servicio guardar(Servicio servicio) {
        validarServicio(servicio);

        if (servicioRepository.existsByNombre(servicio.getNombre())) {
            throw new RuntimeException("Ya existe un servicio con ese nombre");
        }

        return servicioRepository.save(servicio);
    }

    public Servicio actualizar(Long id, Servicio datos) {
        Servicio servicio = obtenerPorId(id);

        servicio.setNombre(datos.getNombre());
        servicio.setDescripcion(datos.getDescripcion());
        servicio.setPrecio(datos.getPrecio());
        servicio.setDuracionMinutos(datos.getDuracionMinutos());
        servicio.setEstado(datos.getEstado());

        validarServicio(servicio);

        return servicioRepository.save(servicio);
    }

    public void eliminar(Long id) {
        Servicio servicio = obtenerPorId(id);
        servicio.setEstado("Inactivo");
        servicioRepository.save(servicio);
    }

    private void validarServicio(Servicio servicio) {
        if (servicio.getNombre() == null || servicio.getNombre().trim().isEmpty()) {
            throw new RuntimeException("El nombre del servicio es obligatorio");
        }

        if (servicio.getPrecio() == null) {
            throw new RuntimeException("El precio del servicio es obligatorio");
        }

        if (servicio.getPrecio().compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("El precio no puede ser negativo");
        }

        if (servicio.getDuracionMinutos() != null && servicio.getDuracionMinutos() <= 0) {
            throw new RuntimeException("La duración debe ser mayor a 0 minutos");
        }

        if (servicio.getEstado() == null || servicio.getEstado().isBlank()) {
            servicio.setEstado("Activo");
        }
    }
}
