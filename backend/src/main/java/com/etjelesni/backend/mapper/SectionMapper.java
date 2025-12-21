package com.etjelesni.backend.mapper;

import com.etjelesni.backend.dto.section.SectionCreateDto;
import com.etjelesni.backend.dto.section.SectionResponseDto;
import com.etjelesni.backend.model.Section;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface SectionMapper {

    @Mapping(target = "semesterId", source = "semester.id")
    SectionResponseDto toResponseDto(Section section);

    List<SectionResponseDto> toResponseDto(List<Section> sections);

    Section toEntity(SectionCreateDto dto);
}
