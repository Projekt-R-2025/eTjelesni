package com.etjelesni.backend.dto.notification;

import com.etjelesni.backend.enumeration.NotificationType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NotificationResponseDto {
    private Long id;
    private String title;
    private String body;
    private NotificationType type;
    private Long sectionId;
    private String creator;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
