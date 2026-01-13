package com.etjelesni.backend.dto.section;

import com.etjelesni.backend.dto.user.UserResponseDto;
import com.etjelesni.backend.enumeration.SectionType;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class SectionResponseDto {
    private Long id;
    private String name;
    private SectionType sectionType;
    private Integer passingPoints;
    private Boolean isLocked;
    private List<UserResponseDto> leaders;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
