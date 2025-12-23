package com.etjelesni.backend.controller;

import com.etjelesni.backend.dto.notification.GeneralNotificationCreateDto;
import com.etjelesni.backend.dto.notification.SectionNotificationCreateDto;
import com.etjelesni.backend.dto.notification.NotificationResponseDto;
import com.etjelesni.backend.dto.notification.NotificationUpdateDto;
import com.etjelesni.backend.service.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/general")
    public ResponseEntity<List<NotificationResponseDto>> getAllGenericNotifications() {
        List<NotificationResponseDto> response = notificationService.getAllGenericNotifications();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/section/{id}")
    public ResponseEntity<List<NotificationResponseDto>> getSectionNotifications(@PathVariable Long id) {
        List<NotificationResponseDto> response = notificationService.getSectionNotifications(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<NotificationResponseDto> getNotificationById(@PathVariable Long id) {
        NotificationResponseDto response = notificationService.getNotificationById((id));
        return ResponseEntity.ok(response);
    }

    @PostMapping("/general")
    public ResponseEntity<NotificationResponseDto> createGeneralNotification(@RequestBody GeneralNotificationCreateDto dto) {
        NotificationResponseDto response = notificationService.createGeneralNotification(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/section")
    public ResponseEntity<NotificationResponseDto> createSectionNotification(@RequestBody SectionNotificationCreateDto dto) {
        NotificationResponseDto response = notificationService.createSectionNotification(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<NotificationResponseDto> updateNotification(@PathVariable Long id, @RequestBody NotificationUpdateDto dto) {
        NotificationResponseDto response = notificationService.updateNotification(id, dto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }

}
