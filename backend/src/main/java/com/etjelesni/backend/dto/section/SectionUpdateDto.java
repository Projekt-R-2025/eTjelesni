package com.etjelesni.backend.dto.section;

import com.etjelesni.backend.enumeration.SectionType;
import lombok.Data;

@Data
public class SectionUpdateDto {
    private String name;
    private SectionType sectionType;
    private Integer passingPoints;
}
