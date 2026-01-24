package com.etjelesni.backend.dto.user;

import com.etjelesni.backend.enumeration.Role;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class UserResponseDto {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private Role role;
    private Long sectionId;
    private String sectionName;
    private Integer currentPoints;
    private List<Long> leadingSectionIds;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
