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
    private Long requestedSectionId;
    private String requestedSectionName;
    private RequestStatus status;
    private String reason;
    private String reviewer;
    private LocalDateTime reviewedAt;
    private String reviewNote;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
