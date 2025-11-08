package com.etjelesni.backend.controller;

import com.etjelesni.backend.dto.role_request.RoleRequestCreateDto;
import com.etjelesni.backend.dto.role_request.RoleRequestResponseDto;
import com.etjelesni.backend.dto.role_request.RoleRequestReviewDto;
import com.etjelesni.backend.enumeration.RequestStatus;
import com.etjelesni.backend.model.RoleRequest;
import com.etjelesni.backend.service.RoleRequestService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/role-requests")
public class RoleRequestController {

    private RoleRequestService roleRequestService;

    public RoleRequestController(RoleRequestService roleRequestService) {
        this.roleRequestService = roleRequestService;
    }

    @GetMapping
    public ResponseEntity<List<RoleRequestResponseDto>> getAllRoleRequests(
            @RequestParam(value = "status", required = false) String status) {
        List<RoleRequestResponseDto> response = roleRequestService.getAllRoleRequests(status);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<List<RoleRequestResponseDto>> getMyRoleRequests() {
        List<RoleRequestResponseDto> response = roleRequestService.getMyRoleRequests();
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<RoleRequestResponseDto> createRoleRequest(@RequestBody RoleRequestCreateDto dto) {
        RoleRequestResponseDto response = roleRequestService.createRoleRequest(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approveRoleRequest(
            @PathVariable Long id,
            @RequestBody RoleRequestReviewDto dto) {
        RoleRequestResponseDto response = roleRequestService.reviewRoleRequest(id, RequestStatus.APPROVED, dto);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rejectRoleRequest(
            @PathVariable Long id,
            @RequestBody RoleRequestReviewDto dto) {
        RoleRequestResponseDto response = roleRequestService.reviewRoleRequest(id, RequestStatus.REJECTED, dto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoleRequest(@PathVariable Long id) {
        roleRequestService.deleteRoleRequest(id);
        return ResponseEntity.noContent().build();
    }

}
