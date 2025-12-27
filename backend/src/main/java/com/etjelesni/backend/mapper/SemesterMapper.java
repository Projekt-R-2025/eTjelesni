package com.etjelesni.backend.mapper;

import com.etjelesni.backend.dto.semester.SemesterCreateDto;
import com.etjelesni.backend.dto.semester.SemesterResponseDto;
import com.etjelesni.backend.model.Semester;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface SemesterMapper {
    SemesterResponseDto toResponseDto(Semester semester);
    List<SemesterResponseDto> toResponseDtoList(List<Semester> semesters);
    Semester toEntity(SemesterCreateDto dto);
}
