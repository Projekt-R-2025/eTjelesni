package com.etjelesni.backend.controller;

import com.etjelesni.backend.dto.semester.SemesterCreateDto;
import com.etjelesni.backend.dto.semester.SemesterResponseDto;
import com.etjelesni.backend.dto.semester.SemesterUpdateDto;
import com.etjelesni.backend.service.SemesterService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/semesters")
public class SemesterController {

    private final SemesterService semesterService;

    public SemesterController(SemesterService semesterService) {
        this.semesterService = semesterService;
    }

    @GetMapping
    public ResponseEntity<List<SemesterResponseDto>> getAllSemesters() {
        List<SemesterResponseDto> response = semesterService.getAllSemesters();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SemesterResponseDto> getSemesterById(@PathVariable Long id) {
        SemesterResponseDto response = semesterService.getSemesterById((id));
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<SemesterResponseDto> createSemester(@RequestBody SemesterCreateDto dto) {
         SemesterResponseDto response = semesterService.createSemester(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SemesterResponseDto> updateSemester(@PathVariable Long id, @RequestBody SemesterUpdateDto dto) {
        SemesterResponseDto response = semesterService.updateSemester(id, dto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSemester(@PathVariable Long id) {
        semesterService.deleteSemester(id);
        return ResponseEntity.noContent().build();
    }

}
