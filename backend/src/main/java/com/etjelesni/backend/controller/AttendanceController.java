package com.etjelesni.backend.controller;

import com.etjelesni.backend.dto.attendance.AttendanceResponseDto;
import com.etjelesni.backend.service.AttendanceService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @GetMapping("/attendances")
    public ResponseEntity<List<AttendanceResponseDto>> getAllGenericAttendances() {
        List<AttendanceResponseDto> response = attendanceService.getAllAttendances();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/attendances/{id}")
    public ResponseEntity<AttendanceResponseDto> getAttendanceById(@PathVariable Long id) {
        AttendanceResponseDto response = attendanceService.getAttendanceById((id));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/sessions/{sessionId}/attendances")
    public ResponseEntity<List<AttendanceResponseDto>> getSessionAttendances(@PathVariable Long sessionId) {
        List<AttendanceResponseDto> response = attendanceService.getSessionAttendances(sessionId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/sessions/{sessionId}/attendances")
    public ResponseEntity<AttendanceResponseDto> createAttendance(@PathVariable Long sessionId) {
        AttendanceResponseDto response = attendanceService.createAttendance(sessionId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/attendances/{id}/cancel")
    public ResponseEntity<AttendanceResponseDto> cancelAttendance(@PathVariable Long id) {
        AttendanceResponseDto response = attendanceService.cancelAttendance(id);
        return ResponseEntity.ok(response);
    }

}
