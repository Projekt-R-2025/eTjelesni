package com.etjelesni.backend.dto.role_request;

import com.etjelesni.backend.dto.user.UserResponseDto;
import com.etjelesni.backend.enumeration.RequestStatus;
import com.etjelesni.backend.enumeration.Role;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class RoleRequestResponseDto {
    private Long id;
    private UserResponseDto user;
    private Role requestedRole;
    private RequestStatus status;
    private String reason;
    private UserResponseDto reviewedBy;
    private LocalDateTime reviewedAt;
    private String reviewNote;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
