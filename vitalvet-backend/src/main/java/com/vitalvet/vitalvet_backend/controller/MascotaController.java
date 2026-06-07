package com.vitalvet.vitalvet_backend.controller;

import com.vitalvet.vitalvet_backend.entity.Mascota;
import com.vitalvet.vitalvet_backend.service.MascotaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mascotas")
public class MascotaController {

    private final MascotaService mascotaService;

    public MascotaController(MascotaService mascotaService) {
        this.mascotaService = mascotaService;
    }

    @GetMapping
    public ResponseEntity<List<Mascota>> listar() {
        return ResponseEntity.ok(mascotaService.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtener(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(mascotaService.obtenerPorId(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/cliente/{idCliente}")
    public ResponseEntity<List<Mascota>> listarPorCliente(@PathVariable Long idCliente) {
        return ResponseEntity.ok(mascotaService.listarPorCliente(idCliente));
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Mascota mascota) {
        try {
            return ResponseEntity.ok(mascotaService.guardar(mascota));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @RequestBody Mascota mascota) {
        try {
            return ResponseEntity.ok(mascotaService.actualizar(id, mascota));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        try {
            mascotaService.eliminar(id);
            return ResponseEntity.ok(Map.of("message", "Mascota desactivada correctamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
