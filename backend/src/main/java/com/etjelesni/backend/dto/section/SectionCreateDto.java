package com.etjelesni.backend.dto.section;

import com.etjelesni.backend.enumeration.SectionType;
import lombok.Data;

@Data
public class SectionCreateDto {
    private String name;
    private SectionType sectionType;
    private Integer passingPoints;
}
