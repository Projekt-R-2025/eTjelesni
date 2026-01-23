package com.etjelesni.backend.service;

import com.etjelesni.backend.dto.notification.GeneralNotificationCreateDto;
import com.etjelesni.backend.dto.notification.NotificationResponseDto;
import com.etjelesni.backend.dto.notification.NotificationUpdateDto;
import com.etjelesni.backend.dto.notification.SectionNotificationCreateDto;
import com.etjelesni.backend.enumeration.NotificationType;
import com.etjelesni.backend.exception.ResourceNotFoundException;
import com.etjelesni.backend.mapper.NotificationMapper;
import com.etjelesni.backend.model.Notification;
import com.etjelesni.backend.model.Section;
import com.etjelesni.backend.repository.NotificationRepository;
import com.etjelesni.backend.service.auth.CurrentUserService;
import com.etjelesni.backend.service.permission.PermissionService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class NotificationService {

    private final NotificationMapper notificationMapper;
    private final NotificationRepository notificationRepository;

    private final CurrentUserService currentUserService;
    private final SectionService sectionService;
    private final PermissionService permissionService;


    public List<NotificationResponseDto> getAllGenericNotifications() {
        List<Notification> notifications = notificationRepository.findAllByType(NotificationType.GENERAL);
        return notificationMapper.toResponseDtoList(notifications);
    }

    public List<NotificationResponseDto> getSectionNotifications(Long sectionId) {
        Section section = sectionService.getSectionOrThrow(sectionId);
        List<Notification> notifications =
                notificationRepository.findAllByTypeAndSection(NotificationType.SECTION, section);
        return notificationMapper.toResponseDtoList(notifications);
    }

    public NotificationResponseDto getNotificationById(Long id) {
        Notification notification = getNotificationOrThrow(id);
        return notificationMapper.toResponseDto(notification);
    }

    public NotificationResponseDto createGeneralNotification(GeneralNotificationCreateDto dto) {
        permissionService.requireCanCreateGeneralNotification();

        Notification notification = notificationMapper.toEntity(dto);
        notification.setType(NotificationType.GENERAL);
        notification.setCreatedBy(currentUserService.getCurrentUser());
        notificationRepository.save(notification);

        return notificationMapper.toResponseDto(notification);
    }

    public NotificationResponseDto createSectionNotification(SectionNotificationCreateDto dto) {
        Section section = sectionService.getSectionOrThrow(dto.getSectionId());

        permissionService.requireCanCreateSectionNotification(section);

        Notification notification = notificationMapper.toEntity(dto);
        notification.setType(NotificationType.SECTION);
        notification.setCreatedBy(currentUserService.getCurrentUser());
        notification.setSection(section);
        notificationRepository.save(notification);

        return notificationMapper.toResponseDto(notification);
    }

    public NotificationResponseDto updateNotification(Long id, NotificationUpdateDto dto) {
        Notification notification = getNotificationOrThrow(id);

        permissionService.requireCanManageNotification(notification);

        if (dto.getTitle() != null) notification.setTitle(dto.getTitle());
        if (dto.getBody() != null) notification.setBody(dto.getBody());

        Notification updatedNotification = notificationRepository.save(notification);
        return notificationMapper.toResponseDto(updatedNotification);
    }

    public void deleteNotification(Long id) {
        Notification notification = getNotificationOrThrow(id);

        permissionService.requireCanManageNotification(notification);

        notificationRepository.delete(notification);
    }

    public Notification getNotificationOrThrow(Long id) {
        return notificationRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));
    }

}
