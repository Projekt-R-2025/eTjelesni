package com.etjelesni.backend.mapper;

import com.etjelesni.backend.dto.user.UserCreateDto;
import com.etjelesni.backend.dto.user.UserResponseDto;
import com.etjelesni.backend.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(source = "section.id", target = "sectionId")
    @Mapping(source = "section.name", target = "sectionName")
    UserResponseDto toResponseDto(User user);

    List<UserResponseDto> toResponseDtoList(List<User> users);

    User toEntity(UserCreateDto dto);

}
