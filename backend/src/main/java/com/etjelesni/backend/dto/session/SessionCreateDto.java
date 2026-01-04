package com.etjelesni.backend.dto.session;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SessionCreateDto {
    private String title;
    private String description;
    private Integer capacity;
    private Integer points;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String startLocation;
    private String endLocation;
    private Long sectionId;
}
