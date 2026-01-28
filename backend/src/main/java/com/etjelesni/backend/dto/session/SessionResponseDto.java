package com.etjelesni.backend.dto.session;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SessionResponseDto {
    private Long id;
    private String title;
    private String description;
    private Integer capacity;
    private Integer points;
    private String sectionName;
    private String sectionType;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String startLocation;
    private String endLocation;
    private Long sectionId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
