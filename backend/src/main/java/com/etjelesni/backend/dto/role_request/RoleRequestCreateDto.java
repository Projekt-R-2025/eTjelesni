package com.etjelesni.backend.dto.role_request;

import com.etjelesni.backend.enumeration.Role;
import lombok.Data;

@Data
public class RoleRequestCreateDto {
    private Long userId;
    private Role requestedRole;
    private Long requestedSectionId;
    private String reason;
}
