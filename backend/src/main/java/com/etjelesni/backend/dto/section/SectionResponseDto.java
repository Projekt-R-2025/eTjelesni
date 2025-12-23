package com.etjelesni.backend.dto.section;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SectionResponseDto {
    private Long id;
    private String name;
    private Integer passingPoints;
    private Boolean isLocked;
    private Boolean isBikeSection;
    private Long semesterId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
