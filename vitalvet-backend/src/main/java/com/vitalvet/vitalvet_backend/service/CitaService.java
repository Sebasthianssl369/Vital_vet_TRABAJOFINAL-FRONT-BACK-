package com.vitalvet.vitalvet_backend.service;

import com.vitalvet.vitalvet_backend.entity.Cita;
import com.vitalvet.vitalvet_backend.entity.Servicio;
import com.vitalvet.vitalvet_backend.repository.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class CitaService {

    private final CitaRepository citaRepository;
    private final ClienteRepository clienteRepository;
    private final MascotaRepository mascotaRepository;
    private final VeterinarioRepository veterinarioRepository;
    private final ServicioRepository servicioRepository;

    public CitaService(
            CitaRepository citaRepository,
            ClienteRepository clienteRepository,
            MascotaRepository mascotaRepository,
            VeterinarioRepository veterinarioRepository,
            ServicioRepository servicioRepository
    ) {
        this.citaRepository = citaRepository;
        this.clienteRepository = clienteRepository;
        this.mascotaRepository = mascotaRepository;
        this.veterinarioRepository = veterinarioRepository;
        this.servicioRepository = servicioRepository;
    }

    public List<Cita> listarTodas() {
        return citaRepository.findAll();
    }

    public List<Cita> listarPorCliente(Long idCliente) {
        return citaRepository.findByIdCliente(idCliente);
    }

    public List<Cita> listarPorMascota(Long idMascota) {
        return citaRepository.findByIdMascota(idMascota);
    }

    public List<Cita> listarPorVeterinario(Long idVeterinario) {
        return citaRepository.findByIdVeterinario(idVeterinario);
    }

    public List<Cita> listarPorFecha(LocalDate fecha) {
        return citaRepository.findByFecha(fecha);
    }

    public Cita obtenerPorId(Long id) {
        return citaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));
    }

    public Cita guardar(Cita cita) {
        validarCita(cita);
        completarDatosAutomaticos(cita);
        return citaRepository.save(cita);
    }

    public Cita actualizar(Long id, Cita datos) {
        Cita cita = obtenerPorId(id);

        cita.setIdCliente(datos.getIdCliente());
        cita.setIdMascota(datos.getIdMascota());
        cita.setIdVeterinario(datos.getIdVeterinario());
        cita.setIdServicio(datos.getIdServicio());
        cita.setFecha(datos.getFecha());
        cita.setHora(datos.getHora());
        cita.setEstado(datos.getEstado());
        cita.setEstadoPago(datos.getEstadoPago());
        cita.setMonto(datos.getMonto());
        cita.setMotivo(datos.getMotivo());
        cita.setObservaciones(datos.getObservaciones());

        validarCita(cita);
        completarDatosAutomaticos(cita);

        return citaRepository.save(cita);
    }

    public Cita cambiarEstado(Long id, String estado) {
        Cita cita = obtenerPorId(id);

        if (estado == null || estado.isBlank()) {
            throw new RuntimeException("El estado es obligatorio");
        }

        cita.setEstado(estado);
        return citaRepository.save(cita);
    }

    public Cita cambiarEstadoPago(Long id, String estadoPago) {
        Cita cita = obtenerPorId(id);

        if (estadoPago == null || estadoPago.isBlank()) {
            throw new RuntimeException("El estado de pago es obligatorio");
        }

        cita.setEstadoPago(estadoPago);

        if (estadoPago.equalsIgnoreCase("pagado")) {
            cita.setEstado("Confirmada");
        }

        return citaRepository.save(cita);
    }

    public void eliminar(Long id) {
        Cita cita = obtenerPorId(id);
        cita.setEstado("Cancelada");
        citaRepository.save(cita);
    }

    private void validarCita(Cita cita) {
        if (cita.getIdCliente() == null) {
            throw new RuntimeException("La cita debe tener un cliente asignado");
        }

        if (!clienteRepository.existsById(cita.getIdCliente())) {
            throw new RuntimeException("El cliente asignado no existe");
        }

        if (cita.getIdMascota() == null) {
            throw new RuntimeException("La cita debe tener una mascota asignada");
        }

        if (!mascotaRepository.existsById(cita.getIdMascota())) {
            throw new RuntimeException("La mascota asignada no existe");
        }

        if (cita.getIdVeterinario() == null) {
            throw new RuntimeException("La cita debe tener un veterinario asignado");
        }

        if (!veterinarioRepository.existsById(cita.getIdVeterinario())) {
            throw new RuntimeException("El veterinario asignado no existe");
        }

        if (cita.getIdServicio() == null) {
            throw new RuntimeException("La cita debe tener un servicio asignado");
        }

        if (!servicioRepository.existsById(cita.getIdServicio())) {
            throw new RuntimeException("El servicio asignado no existe");
        }

        if (cita.getFecha() == null) {
            throw new RuntimeException("La fecha de la cita es obligatoria");
        }

        if (cita.getFecha().isBefore(LocalDate.now())) {
            throw new RuntimeException("No se puede registrar una cita en una fecha anterior a hoy");
        }

        if (cita.getHora() == null) {
            throw new RuntimeException("La hora de la cita es obligatoria");
        }
    }

    private void completarDatosAutomaticos(Cita cita) {
        if (cita.getEstado() == null || cita.getEstado().isBlank()) {
            cita.setEstado("Pendiente");
        }

        if (cita.getEstadoPago() == null || cita.getEstadoPago().isBlank()) {
            cita.setEstadoPago("pendiente");
        }

        Servicio servicio = servicioRepository.findById(cita.getIdServicio())
                .orElseThrow(() -> new RuntimeException("Servicio no encontrado"));

        if (cita.getMonto() == null || cita.getMonto().compareTo(BigDecimal.ZERO) <= 0) {
            cita.setMonto(servicio.getPrecio());
        }

        if (cita.getFechaCreacion() == null) {
            cita.setFechaCreacion(java.time.LocalDateTime.now());
        }
    }
}
