package com.etjelesni.backend.dto.application;

import com.etjelesni.backend.enumeration.Role;
import lombok.Data;

@Data
public class ApplicationCreateDto {
    private Long userId;
    private Long requestedSectionId;
    private String reason;
}
