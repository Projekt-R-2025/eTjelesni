package com.etjelesni.backend.service;

import com.etjelesni.backend.dto.notification.GeneralNotificationCreateDto;
import com.etjelesni.backend.dto.notification.NotificationResponseDto;
import com.etjelesni.backend.dto.notification.NotificationUpdateDto;
import com.etjelesni.backend.dto.notification.SectionNotificationCreateDto;
import com.etjelesni.backend.dto.semester.SemesterResponseDto;
import com.etjelesni.backend.enumeration.NotificationType;
import com.etjelesni.backend.exception.ResourceNotFoundException;
import com.etjelesni.backend.mapper.NotificationMapper;
import com.etjelesni.backend.model.Notification;
import com.etjelesni.backend.model.Section;
import com.etjelesni.backend.model.Semester;
import com.etjelesni.backend.model.User;
import com.etjelesni.backend.repository.NotificationRepository;
import com.etjelesni.backend.repository.SectionRepository;
import com.etjelesni.backend.service.auth.CurrentUserService;
import lombok.AllArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class NotificationService {

    private final NotificationMapper notificationMapper;
    private final NotificationRepository notificationRepository;

    private final SectionRepository sectionRepository;

    private final CurrentUserService currentUserService;


    public List<NotificationResponseDto> getAllGenericNotifications() {
        List<Notification> notifications = notificationRepository.findAllByType(com.etjelesni.backend.enumeration.NotificationType.GENERAL);
        return notificationMapper.toResponseDto(notifications);
    }

    public List<NotificationResponseDto> getSectionNotifications(Long id) {
        List<Notification> notifications =
                notificationRepository.findAllByTypeAndSectionId(
                        NotificationType.SECTION,
                        id
                );

        return notificationMapper.toResponseDto(notifications);
    }

    public NotificationResponseDto getNotificationById(Long id) {
        Notification notification = getNotificationOrThrow(id);
        return notificationMapper.toResponseDto(notification);
    }


    public NotificationResponseDto createGeneralNotification(GeneralNotificationCreateDto dto) {
        Notification notification = notificationMapper.toEntity(dto);

        notification.setType(NotificationType.GENERAL);

        notificationRepository.save(notification);
        return notificationMapper.toResponseDto(notification);
    }

    public NotificationResponseDto createSectionNotification(SectionNotificationCreateDto dto) {
        Notification notification = notificationMapper.toEntity(dto);

        notification.setType(NotificationType.SECTION);

        Section section = sectionRepository.findById(dto.getSectionId())
                .orElseThrow(() -> new RuntimeException("Section ne postoji"));

        notification.setSection(section);

        notificationRepository.save(notification);
        return notificationMapper.toResponseDto(notification);
    }



    public NotificationResponseDto updateNotification(Long id, NotificationUpdateDto dto) {
        Notification notification = getNotificationOrThrow(id);

        if (dto.getTitle() != null) notification.setTitle(dto.getTitle());
        if (dto.getBody() != null) notification.setBody(dto.getBody());

        Notification updatedNotification = notificationRepository.save(notification);
        return notificationMapper.toResponseDto(updatedNotification);
    }

    public void deleteNotification(Long id) {
        Notification notification = getNotificationOrThrow(id);
        User currentUser = currentUserService.getCurrentUser();
        if (currentUser.isProfessor() || currentUser.isAdmin()) {
            notificationRepository.deleteById(id);
            return;
        }
        throw new AccessDeniedException("You do not have permission to delete this notification");
    }

    public Notification getNotificationOrThrow(Long id) {
        return notificationRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));
    }


}
