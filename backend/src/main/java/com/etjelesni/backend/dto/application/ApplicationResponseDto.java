package com.etjelesni.backend.dto.application;

import com.etjelesni.backend.dto.user.UserResponseDto;
import com.etjelesni.backend.enumeration.RequestStatus;
import com.etjelesni.backend.enumeration.Role;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ApplicationResponseDto {
    private Long id;
    private UserResponseDto applicant;
    private Long sectionId;
    private String sectionName;
    private RequestStatus status;
    private String reason;
    private String reviewer;
    private LocalDateTime reviewedAt;
    private String reviewNote;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
