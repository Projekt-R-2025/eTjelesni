package com.etjelesni.backend.controller;

import com.etjelesni.backend.dto.application.ApplicationCreateDto;
import com.etjelesni.backend.dto.application.ApplicationResponseDto;
import com.etjelesni.backend.dto.application.ApplicationReviewDto;
import com.etjelesni.backend.enumeration.RequestStatus;
import com.etjelesni.backend.service.ApplicationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @GetMapping
    public ResponseEntity<List<ApplicationResponseDto>> getAllApplications(
            @RequestParam(value = "status", required = false) String status) {
        List<ApplicationResponseDto> response = applicationService.getAllApplications(status);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<List<ApplicationResponseDto>> getMyApplications() {
        List<ApplicationResponseDto> response = applicationService.getMyApplications();
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<ApplicationResponseDto> createApplication(@RequestBody ApplicationCreateDto dto) {
        ApplicationResponseDto response = applicationService.createApplication(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<ApplicationResponseDto> approveApplication(
            @PathVariable Long id,
            @RequestBody ApplicationReviewDto dto) {
        ApplicationResponseDto response = applicationService.reviewApplication(id, RequestStatus.APPROVED, dto);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ApplicationResponseDto> rejectApplication(
            @PathVariable Long id,
            @RequestBody ApplicationReviewDto dto) {
        ApplicationResponseDto response = applicationService.reviewApplication(id, RequestStatus.REJECTED, dto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApplication(@PathVariable Long id) {
        applicationService.deleteApplication(id);
        return ResponseEntity.noContent().build();
    }

}
