package com.etjelesni.backend.dto.semester;

import lombok.Data;

import java.time.LocalDate;

@Data
public class SemesterUpdateDto {
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
}
