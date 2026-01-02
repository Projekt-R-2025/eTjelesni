package com.etjelesni.backend.dto.session;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SessionCreateDto {
    private Integer capacity;
    private Integer points;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Long sectionId;
}
