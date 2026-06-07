package com.vitalvet.vitalvet_backend.service;

import com.vitalvet.vitalvet_backend.entity.Veterinario;
import com.vitalvet.vitalvet_backend.repository.VeterinarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VeterinarioService {

    private final VeterinarioRepository veterinarioRepository;

    public VeterinarioService(VeterinarioRepository veterinarioRepository) {
        this.veterinarioRepository = veterinarioRepository;
    }

    public List<Veterinario> listarTodos() {
        return veterinarioRepository.findAll();
    }

    public List<Veterinario> listarActivos() {
        return veterinarioRepository.findByEstado("Activo");
    }

    public Veterinario obtenerPorId(Long id) {
        return veterinarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Veterinario no encontrado"));
    }

    public Veterinario guardar(Veterinario veterinario) {
        validarVeterinario(veterinario);
        return veterinarioRepository.save(veterinario);
    }

    public Veterinario actualizar(Long id, Veterinario datos) {
        Veterinario veterinario = obtenerPorId(id);

        veterinario.setNombre(datos.getNombre());
        veterinario.setApellido(datos.getApellido());
        veterinario.setEspecialidad(datos.getEspecialidad());
        veterinario.setTelefono(datos.getTelefono());
        veterinario.setEmail(datos.getEmail());
        veterinario.setCmp(datos.getCmp());
        veterinario.setFoto(datos.getFoto());
        veterinario.setEstado(datos.getEstado());

        validarVeterinario(veterinario);

        return veterinarioRepository.save(veterinario);
    }

    public void eliminar(Long id) {
        Veterinario veterinario = obtenerPorId(id);
        veterinario.setEstado("Inactivo");
        veterinarioRepository.save(veterinario);
    }

    private void validarVeterinario(Veterinario veterinario) {
        if (veterinario.getNombre() == null || veterinario.getNombre().trim().isEmpty()) {
            throw new RuntimeException("El nombre del veterinario es obligatorio");
        }

        if (veterinario.getApellido() == null || veterinario.getApellido().trim().isEmpty()) {
            throw new RuntimeException("El apellido del veterinario es obligatorio");
        }

        if (veterinario.getEspecialidad() == null || veterinario.getEspecialidad().trim().isEmpty()) {
            throw new RuntimeException("La especialidad es obligatoria");
        }

        if (veterinario.getTelefono() != null && !veterinario.getTelefono().isBlank()
                && !veterinario.getTelefono().matches("\\d{9}")) {
            throw new RuntimeException("El teléfono debe tener 9 dígitos");
        }

        if (veterinario.getEmail() != null && !veterinario.getEmail().isBlank()
                && !veterinario.getEmail().matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            throw new RuntimeException("El correo electrónico no es válido");
        }

        if (veterinario.getEstado() == null || veterinario.getEstado().isBlank()) {
            veterinario.setEstado("Activo");
        }

        if (veterinario.getFoto() == null || veterinario.getFoto().isBlank()) {
            veterinario.setFoto("🩺");
        }
    }
}
