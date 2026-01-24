package com.etjelesni.backend.mapper;


import com.etjelesni.backend.dto.application.ApplicationResponseDto;
import com.etjelesni.backend.model.Application;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface ApplicationMapper {
    @Mapping(source = "section.id", target = "sectionId")
    @Mapping(target = "sectionName", expression = "java(getSectionName(application))")
    @Mapping(target = "reviewer", expression = "java(getReviewerName(application))")
    ApplicationResponseDto toResponseDto(Application application);
    List<ApplicationResponseDto> toResponseDtoList(List<Application> Applications);

    default String getReviewerName(Application application) {
        if (application.getReviewedBy() == null) {
            return null;
        }
        return application.getReviewedBy().getFirstName() + " " + application.getReviewedBy().getLastName();
    }

    default String getSectionName(Application application) {
        if (application.getSection() == null) {
            return null;
        }
        return application.getSection().getName();
    }

}
