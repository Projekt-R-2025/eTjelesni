package com.etjelesni.backend.mapper;

import com.etjelesni.backend.dto.session.SessionCreateDto;
import com.etjelesni.backend.dto.session.SessionResponseDto;
import com.etjelesni.backend.model.Session;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface SessionMapper {

    @Mapping(target = "sectionId", source = "section.id")
    SessionResponseDto toResponseDto(Session session);

    List<SessionResponseDto> toResponseDtoList(List<Session> sessions);

    Session toEntity(SessionCreateDto dto);
}
