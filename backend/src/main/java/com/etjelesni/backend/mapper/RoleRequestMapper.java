package com.etjelesni.backend.mapper;

import com.etjelesni.backend.dto.role_request.RoleRequestResponseDto;
import com.etjelesni.backend.model.RoleRequest;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface RoleRequestMapper {
    RoleRequestResponseDto toResponseDto(RoleRequest RoleRequest);
    List<RoleRequestResponseDto> toResponseDto(List<RoleRequest> RoleRequests);
}
