package com.etjelesni.backend.mapper;

import com.etjelesni.backend.dto.role_request.RoleRequestResponseDto;
import com.etjelesni.backend.model.RoleRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface RoleRequestMapper {
    @Mapping(source = "requestedSection.id", target = "requestedSectionId")
    RoleRequestResponseDto toResponseDto(RoleRequest RoleRequest);
    List<RoleRequestResponseDto> toResponseDtoList(List<RoleRequest> RoleRequests);
}
