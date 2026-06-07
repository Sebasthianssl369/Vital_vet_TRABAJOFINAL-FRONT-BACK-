package com.vitalvet.vitalvet_backend.controller;

import com.vitalvet.vitalvet_backend.entity.Cita;
import com.vitalvet.vitalvet_backend.service.CitaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/citas")
public class CitaController {

    private final CitaService citaService;

    public CitaController(CitaService citaService) {
        this.citaService = citaService;
    }

    @GetMapping
    public ResponseEntity<List<Cita>> listar() {
        return ResponseEntity.ok(citaService.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtener(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(citaService.obtenerPorId(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/cliente/{idCliente}")
    public ResponseEntity<List<Cita>> listarPorCliente(@PathVariable Long idCliente) {
        return ResponseEntity.ok(citaService.listarPorCliente(idCliente));
    }

    @GetMapping("/mascota/{idMascota}")
    public ResponseEntity<List<Cita>> listarPorMascota(@PathVariable Long idMascota) {
        return ResponseEntity.ok(citaService.listarPorMascota(idMascota));
    }

    @GetMapping("/veterinario/{idVeterinario}")
    public ResponseEntity<List<Cita>> listarPorVeterinario(@PathVariable Long idVeterinario) {
        return ResponseEntity.ok(citaService.listarPorVeterinario(idVeterinario));
    }

    @GetMapping("/fecha/{fecha}")
    public ResponseEntity<?> listarPorFecha(@PathVariable String fecha) {
        try {
            LocalDate fechaParseada = LocalDate.parse(fecha);
            return ResponseEntity.ok(citaService.listarPorFecha(fechaParseada));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Fecha inválida. Usa formato YYYY-MM-DD"));
        }
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Cita cita) {
        try {
            return ResponseEntity.ok(citaService.guardar(cita));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @RequestBody Cita cita) {
        try {
            return ResponseEntity.ok(citaService.actualizar(id, cita));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            String estado = body.get("estado");
            return ResponseEntity.ok(citaService.cambiarEstado(id, estado));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/pago")
    public ResponseEntity<?> cambiarEstadoPago(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            String estadoPago = body.get("estadoPago");

            if (estadoPago == null) {
                estadoPago = body.get("estado_pago");
            }

            return ResponseEntity.ok(citaService.cambiarEstadoPago(id, estadoPago));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        try {
            citaService.eliminar(id);
            return ResponseEntity.ok(Map.of("message", "Cita cancelada correctamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
