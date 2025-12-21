package com.etjelesni.backend.controller;

import com.etjelesni.backend.dto.section.SectionCreateDto;
import com.etjelesni.backend.dto.section.SectionResponseDto;
import com.etjelesni.backend.dto.section.SectionUpdateDto;
import com.etjelesni.backend.service.SectionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/sections")
public class SectionController {

    private final SectionService sectionService;

    public SectionController(SectionService sectionService) {
        this.sectionService = sectionService;
    }

    @GetMapping
    public ResponseEntity<List<SectionResponseDto>> getAllSections() {
        List<SectionResponseDto> response = sectionService.getAllSections();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SectionResponseDto> getSectionById(@PathVariable Long id) {
        SectionResponseDto response = sectionService.getSectionById((id));
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<SectionResponseDto> createSection(@RequestBody SectionCreateDto dto) {
        SectionResponseDto response = sectionService.createSection(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SectionResponseDto> updateSection(@PathVariable Long id, @RequestBody SectionUpdateDto dto) {
        SectionResponseDto response = sectionService.updateSection(id, dto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSection(@PathVariable Long id) {
        sectionService.deleteSection(id);
        return ResponseEntity.noContent().build();
    }
}
