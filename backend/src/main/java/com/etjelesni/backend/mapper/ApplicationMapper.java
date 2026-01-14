package com.etjelesni.backend.mapper;


import com.etjelesni.backend.dto.application.ApplicationResponseDto;
import com.etjelesni.backend.model.Application;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface ApplicationMapper {
    @Mapping(source = "section.id", target = "sectionId")
    ApplicationResponseDto toResponseDto(Application Application);
    List<ApplicationResponseDto> toResponseDtoList(List<Application> Applications);
}
