package com.vitalvet.vitalvet_backend.service;

import com.vitalvet.vitalvet_backend.entity.Cliente;
import com.vitalvet.vitalvet_backend.repository.ClienteRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;

    public ClienteService(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    public List<Cliente> listarTodos() {
        return clienteRepository.findAll();
    }

    public Cliente obtenerPorId(Long id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
    }

    public Cliente guardar(Cliente cliente) {
        validarCliente(cliente);
        return clienteRepository.save(cliente);
    }

    public Cliente actualizar(Long id, Cliente datos) {
        Cliente cliente = obtenerPorId(id);

        cliente.setNombre(datos.getNombre());
        cliente.setApellido(datos.getApellido());
        cliente.setDni(datos.getDni());
        cliente.setTelefono(datos.getTelefono());
        cliente.setEmail(datos.getEmail());
        cliente.setDireccion(datos.getDireccion());
        cliente.setEstado(datos.getEstado());

        validarCliente(cliente);

        return clienteRepository.save(cliente);
    }

    public void eliminar(Long id) {
        Cliente cliente = obtenerPorId(id);
        cliente.setEstado("Inactivo");
        clienteRepository.save(cliente);
    }

    private void validarCliente(Cliente cliente) {
        if (cliente.getNombre() == null || cliente.getNombre().trim().isEmpty()) {
            throw new RuntimeException("El nombre del cliente es obligatorio");
        }

        if (cliente.getApellido() == null || cliente.getApellido().trim().isEmpty()) {
            throw new RuntimeException("El apellido del cliente es obligatorio");
        }

        if (cliente.getDni() == null || !cliente.getDni().matches("\\d{8}")) {
            throw new RuntimeException("El DNI debe tener 8 dígitos");
        }

        if (cliente.getTelefono() != null && !cliente.getTelefono().isBlank()
                && !cliente.getTelefono().matches("\\d{9}")) {
            throw new RuntimeException("El teléfono debe tener 9 dígitos");
        }

        if (cliente.getEmail() != null && !cliente.getEmail().isBlank()
                && !cliente.getEmail().matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            throw new RuntimeException("El correo electrónico no es válido");
        }
    }
}
