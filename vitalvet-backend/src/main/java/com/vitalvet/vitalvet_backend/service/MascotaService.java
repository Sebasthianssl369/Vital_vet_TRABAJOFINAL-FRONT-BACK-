package com.vitalvet.vitalvet_backend.service;

import com.vitalvet.vitalvet_backend.entity.Mascota;
import com.vitalvet.vitalvet_backend.repository.ClienteRepository;
import com.vitalvet.vitalvet_backend.repository.MascotaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MascotaService {

    private final MascotaRepository mascotaRepository;
    private final ClienteRepository clienteRepository;

    public MascotaService(MascotaRepository mascotaRepository, ClienteRepository clienteRepository) {
        this.mascotaRepository = mascotaRepository;
        this.clienteRepository = clienteRepository;
    }

    public List<Mascota> listarTodas() {
        return mascotaRepository.findAll();
    }

    public List<Mascota> listarPorCliente(Long idCliente) {
        return mascotaRepository.findByIdCliente(idCliente);
    }

    public Mascota obtenerPorId(Long id) {
        return mascotaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mascota no encontrada"));
    }

    public Mascota guardar(Mascota mascota) {
        validarMascota(mascota);
        return mascotaRepository.save(mascota);
    }

    public Mascota actualizar(Long id, Mascota datos) {
        Mascota mascota = obtenerPorId(id);

        mascota.setIdCliente(datos.getIdCliente());
        mascota.setNombre(datos.getNombre());
        mascota.setEspecie(datos.getEspecie());
        mascota.setRaza(datos.getRaza());
        mascota.setEdad(datos.getEdad());
        mascota.setSexo(datos.getSexo());
        mascota.setPeso(datos.getPeso());
        mascota.setColor(datos.getColor());
        mascota.setFechaNacimiento(datos.getFechaNacimiento());
        mascota.setEstado(datos.getEstado());
        mascota.setObservaciones(datos.getObservaciones());

        validarMascota(mascota);

        return mascotaRepository.save(mascota);
    }

    public void eliminar(Long id) {
        Mascota mascota = obtenerPorId(id);
        mascota.setEstado("Inactivo");
        mascotaRepository.save(mascota);
    }

    private void validarMascota(Mascota mascota) {
        if (mascota.getIdCliente() == null) {
            throw new RuntimeException("La mascota debe tener un cliente asignado");
        }

        if (!clienteRepository.existsById(mascota.getIdCliente())) {
            throw new RuntimeException("El cliente asignado no existe");
        }

        if (mascota.getNombre() == null || mascota.getNombre().trim().isEmpty()) {
            throw new RuntimeException("El nombre de la mascota es obligatorio");
        }

        if (mascota.getEspecie() == null || mascota.getEspecie().trim().isEmpty()) {
            throw new RuntimeException("La especie de la mascota es obligatoria");
        }

        if (mascota.getEdad() != null && mascota.getEdad() < 0) {
            throw new RuntimeException("La edad no puede ser negativa");
        }

        if (mascota.getPeso() != null && mascota.getPeso().doubleValue() < 0) {
            throw new RuntimeException("El peso no puede ser negativo");
        }
    }
}
