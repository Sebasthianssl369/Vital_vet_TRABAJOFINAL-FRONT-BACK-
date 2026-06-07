package com.vitalvet.vitalvet_backend.controller;

import com.vitalvet.vitalvet_backend.entity.HistorialClinico;
import com.vitalvet.vitalvet_backend.service.HistorialClinicoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/historial")
public class HistorialClinicoController {

    private final HistorialClinicoService historialService;

    public HistorialClinicoController(HistorialClinicoService historialService) {
        this.historialService = historialService;
    }

    @GetMapping
    public ResponseEntity<List<HistorialClinico>> listar() {
        return ResponseEntity.ok(historialService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtener(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(historialService.obtenerPorId(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/mascota/{idMascota}")
    public ResponseEntity<List<HistorialClinico>> listarPorMascota(@PathVariable Long idMascota) {
        return ResponseEntity.ok(historialService.listarPorMascota(idMascota));
    }

    @GetMapping("/veterinario/{idVeterinario}")
    public ResponseEntity<List<HistorialClinico>> listarPorVeterinario(@PathVariable Long idVeterinario) {
        return ResponseEntity.ok(historialService.listarPorVeterinario(idVeterinario));
    }

    @GetMapping("/cita/{idCita}")
    public ResponseEntity<List<HistorialClinico>> listarPorCita(@PathVariable Long idCita) {
        return ResponseEntity.ok(historialService.listarPorCita(idCita));
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody HistorialClinico historial) {
        try {
            return ResponseEntity.ok(historialService.guardar(historial));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @RequestBody HistorialClinico historial) {
        try {
            return ResponseEntity.ok(historialService.actualizar(id, historial));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        try {
            historialService.eliminar(id);
            return ResponseEntity.ok(Map.of("message", "Historial clínico eliminado correctamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
