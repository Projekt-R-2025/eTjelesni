package com.etjelesni.backend.mapper;

import com.etjelesni.backend.dto.role_request.RoleRequestResponseDto;
import com.etjelesni.backend.model.RoleRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface RoleRequestMapper {
    @Mapping(source = "requestedSection.id", target = "requestedSectionId")
    @Mapping(target = "requestedSectionName", expression = "java(getSectionName(roleRequest))")
    @Mapping(target = "reviewer", expression = "java(getReviewerName(roleRequest))")
    RoleRequestResponseDto toResponseDto(RoleRequest roleRequest);
    List<RoleRequestResponseDto> toResponseDtoList(List<RoleRequest> RoleRequests);

    default String getReviewerName(RoleRequest roleRequest) {
        if (roleRequest.getReviewedBy() == null) {
            return null;
        }
        return roleRequest.getReviewedBy().getFirstName() + " " + roleRequest.getReviewedBy().getLastName();
    }

    default String getSectionName(RoleRequest roleRequest) {
        if (roleRequest.getRequestedSection() == null) {
            return null;
        }
        return roleRequest.getRequestedSection().getName();
    }

}
