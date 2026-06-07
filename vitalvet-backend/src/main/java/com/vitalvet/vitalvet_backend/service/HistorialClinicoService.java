package com.vitalvet.vitalvet_backend.service;

import com.vitalvet.vitalvet_backend.entity.HistorialClinico;
import com.vitalvet.vitalvet_backend.repository.CitaRepository;
import com.vitalvet.vitalvet_backend.repository.HistorialClinicoRepository;
import com.vitalvet.vitalvet_backend.repository.MascotaRepository;
import com.vitalvet.vitalvet_backend.repository.VeterinarioRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class HistorialClinicoService {

    private final HistorialClinicoRepository historialRepository;
    private final MascotaRepository mascotaRepository;
    private final VeterinarioRepository veterinarioRepository;
    private final CitaRepository citaRepository;

    public HistorialClinicoService(
            HistorialClinicoRepository historialRepository,
            MascotaRepository mascotaRepository,
            VeterinarioRepository veterinarioRepository,
            CitaRepository citaRepository
    ) {
        this.historialRepository = historialRepository;
        this.mascotaRepository = mascotaRepository;
        this.veterinarioRepository = veterinarioRepository;
        this.citaRepository = citaRepository;
    }

    public List<HistorialClinico> listarTodos() {
        return historialRepository.findAll();
    }

    public List<HistorialClinico> listarPorMascota(Long idMascota) {
        return historialRepository.findByIdMascota(idMascota);
    }

    public List<HistorialClinico> listarPorVeterinario(Long idVeterinario) {
        return historialRepository.findByIdVeterinario(idVeterinario);
    }

    public List<HistorialClinico> listarPorCita(Long idCita) {
        return historialRepository.findByIdCita(idCita);
    }

    public HistorialClinico obtenerPorId(Long id) {
        return historialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Historial clínico no encontrado"));
    }

    public HistorialClinico guardar(HistorialClinico historial) {
        validarHistorial(historial);

        if (historial.getFecha() == null) {
            historial.setFecha(LocalDateTime.now());
        }

        return historialRepository.save(historial);
    }

    public HistorialClinico actualizar(Long id, HistorialClinico datos) {
        HistorialClinico historial = obtenerPorId(id);

        historial.setIdMascota(datos.getIdMascota());
        historial.setIdVeterinario(datos.getIdVeterinario());
        historial.setIdCita(datos.getIdCita());
        historial.setFecha(datos.getFecha() != null ? datos.getFecha() : historial.getFecha());
        historial.setMotivo(datos.getMotivo());
        historial.setDiagnostico(datos.getDiagnostico());
        historial.setTratamiento(datos.getTratamiento());
        historial.setObservaciones(datos.getObservaciones());

        validarHistorial(historial);

        return historialRepository.save(historial);
    }

    public void eliminar(Long id) {
        HistorialClinico historial = obtenerPorId(id);
        historialRepository.delete(historial);
    }

    private void validarHistorial(HistorialClinico historial) {
        if (historial.getIdMascota() == null) {
            throw new RuntimeException("Debe seleccionar una mascota");
        }

        if (!mascotaRepository.existsById(historial.getIdMascota())) {
            throw new RuntimeException("La mascota seleccionada no existe");
        }

        if (historial.getIdVeterinario() == null) {
            throw new RuntimeException("Debe seleccionar un veterinario");
        }

        if (!veterinarioRepository.existsById(historial.getIdVeterinario())) {
            throw new RuntimeException("El veterinario seleccionado no existe");
        }

        if (historial.getIdCita() != null && !citaRepository.existsById(historial.getIdCita())) {
            throw new RuntimeException("La cita asociada no existe");
        }

        if (historial.getMotivo() == null || historial.getMotivo().trim().isEmpty()) {
            throw new RuntimeException("El motivo es obligatorio");
        }

        if (historial.getDiagnostico() == null || historial.getDiagnostico().trim().isEmpty()) {
            throw new RuntimeException("El diagnóstico es obligatorio");
        }

        if (historial.getTratamiento() == null || historial.getTratamiento().trim().isEmpty()) {
            throw new RuntimeException("El tratamiento es obligatorio");
        }
    }
}
