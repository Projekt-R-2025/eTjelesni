package com.etjelesni.backend.dto.attendance;


import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AttendanceResponseDto {
    private Long id;
    private Boolean cancelled;
    private String cancellationReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long sessionId;
    private Long studentId;
}
