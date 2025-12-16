package com.etjelesni.backend.dto.semester;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class SemesterCreateDto {
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
}
