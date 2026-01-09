package com.etjelesni.backend.mapper;

import com.etjelesni.backend.dto.user.UserCreateDto;
import com.etjelesni.backend.dto.user.UserResponseDto;
import com.etjelesni.backend.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "leadingSectionIds", expression = "java(mapSectionIds(user))")
    UserResponseDto toResponseDto(User user);

    List<UserResponseDto> toResponseDtoList(List<User> users);

    User toEntity(UserCreateDto dto);

    default List<Long> mapSectionIds(User user) {
        if (user.getLeadingSections() == null) {
            return Collections.emptyList();
        }

        return user.getLeadingSections().stream()
                .map(ls -> ls.getSection().getId())
                .collect(Collectors.toList());
    }
}
