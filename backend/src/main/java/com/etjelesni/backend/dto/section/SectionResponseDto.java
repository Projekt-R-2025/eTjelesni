package com.etjelesni.backend.dto.section;

import com.etjelesni.backend.model.User;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class SectionResponseDto {
    private Long id;
    private String name;
    private Integer passingPoints;
    private Boolean isLocked;
    private Boolean isBikeSection;
    private Long semesterId;
    private List<User> leaders;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
