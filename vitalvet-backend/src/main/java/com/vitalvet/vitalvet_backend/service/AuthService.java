package com.vitalvet.vitalvet_backend.service;

import com.vitalvet.vitalvet_backend.dto.LoginRequest;
import com.vitalvet.vitalvet_backend.dto.LoginResponse;
import com.vitalvet.vitalvet_backend.dto.RegistroRequest;
import com.vitalvet.vitalvet_backend.entity.Usuario;
import com.vitalvet.vitalvet_backend.repository.UsuarioRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;

    public AuthService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @PostConstruct
    public void crearUsuariosDemo() {
        if (usuarioRepository.count() > 0) {
            return;
        }

        Usuario admin = Usuario.builder()
                .username("admin")
                .password("1234")
                .rol("administrador")
                .nombre("Administrador")
                .apellido("VitalVet")
                .email("admin@vitalvet.com")
                .activo(true)
                .build();

        Usuario cliente = Usuario.builder()
                .username("cliente")
                .password("1234")
                .rol("cliente")
                .nombre("Cliente")
                .apellido("Demo")
                .email("cliente@vitalvet.com")
                .dni("12345678")
                .telefono("987654321")
                .idCliente(1L)
                .activo(true)
                .build();

        usuarioRepository.save(admin);
        usuarioRepository.save(cliente);
    }

    public LoginResponse login(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (Boolean.FALSE.equals(usuario.getActivo())) {
            throw new RuntimeException("El usuario está inactivo");
        }

        if (!usuario.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("Contraseña incorrecta");
        }

        if (!usuario.getRol().equalsIgnoreCase(request.getRol())) {
            throw new RuntimeException("El rol seleccionado no corresponde al usuario");
        }

        return mapToLoginResponse(usuario);
    }

    public LoginResponse registrarCliente(RegistroRequest request) {
        if (usuarioRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("El nombre de usuario ya existe");
        }

        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("El correo ya está registrado");
        }

        if (usuarioRepository.existsByDni(request.getDni())) {
            throw new RuntimeException("El DNI ya está registrado");
        }

        Long nuevoIdCliente = usuarioRepository.count() + 1;

        Usuario usuario = Usuario.builder()
                .username(request.getUsername())
                .password(request.getPassword())
                .rol("cliente")
                .nombre(request.getNombre())
                .apellido(request.getApellido())
                .dni(request.getDni())
                .telefono(request.getTelefono())
                .email(request.getEmail())
                .idCliente(nuevoIdCliente)
                .activo(true)
                .build();

        Usuario guardado = usuarioRepository.save(usuario);

        return mapToLoginResponse(guardado);
    }

    private LoginResponse mapToLoginResponse(Usuario usuario) {
        return LoginResponse.builder()
                .idUsuario(usuario.getIdUsuario())
                .idCliente(usuario.getIdCliente())
                .username(usuario.getUsername())
                .nombre(usuario.getNombre())
                .apellido(usuario.getApellido())
                .email(usuario.getEmail())
                .rol(usuario.getRol())
                .token("demo-token-" + usuario.getRol())
                .build();
    }
}
