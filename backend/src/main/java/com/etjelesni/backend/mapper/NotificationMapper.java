package com.etjelesni.backend.mapper;

import com.etjelesni.backend.dto.notification.GeneralNotificationCreateDto;
import com.etjelesni.backend.dto.notification.SectionNotificationCreateDto;
import com.etjelesni.backend.dto.notification.NotificationResponseDto;
import com.etjelesni.backend.model.Notification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface NotificationMapper {

    @Mapping(source = "section.id", target = "sectionId")
    NotificationResponseDto toResponseDto(Notification notification);

    List<NotificationResponseDto> toResponseDtoList(List<Notification> notifications);

    // GENERAL
    Notification toEntity(GeneralNotificationCreateDto dto);

    // SECTION
    Notification toEntity(SectionNotificationCreateDto dto);

}
