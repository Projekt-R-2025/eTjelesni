package com.etjelesni.backend.dto.notification;

import lombok.Data;

@Data
public class SectionNotificationCreateDto {
    private String title;
    private String body;
    private Long sectionId;
}
