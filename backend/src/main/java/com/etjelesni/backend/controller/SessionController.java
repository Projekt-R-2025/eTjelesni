package com.etjelesni.backend.controller;

import com.etjelesni.backend.dto.session.SessionCreateDto;
import com.etjelesni.backend.dto.session.SessionResponseDto;
import com.etjelesni.backend.service.SessionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
public class SessionController {

    private final SessionService sessionService;

    public SessionController(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    @GetMapping("/section/{id}")
    public ResponseEntity<List<SessionResponseDto>> getAllSessions(@PathVariable Long id) {
        List<SessionResponseDto> response = sessionService.getAllSessions((id));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SessionResponseDto> getSessionById(@PathVariable Long id) {
        SessionResponseDto response = sessionService.getSessionById((id));
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<SessionResponseDto> createSession(@RequestBody SessionCreateDto dto) {
        SessionResponseDto response = sessionService.createSession(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSession(@PathVariable Long id) {
        sessionService.deleteSession(id);
        return ResponseEntity.noContent().build();
    }
}
