package com.etjelesni.backend.dto.section;

import lombok.Data;

@Data
public class SectionCreateDto {
    private String name;
    private Integer passingPoints;
    private Boolean isBikeSection;
}
