package com.etjelesni.backend.dto.notification;

import com.etjelesni.backend.dto.user.UserResponseDto;
import com.etjelesni.backend.enumeration.NotificationType;
import com.etjelesni.backend.model.Section;
import com.etjelesni.backend.model.User;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class NotificationResponseDto {
    private Long id;
    private String title;
    private String body;
    private NotificationType type;
    private Long sectionId;
    private UserResponseDto createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
