package com.etjelesni.backend.enumeration;

import lombok.Getter;

@Getter
public enum Role {
    STUDENT(1),
    LEADER(2),
    PROFESSOR(3),
    ADMIN(4);

    private final int level;

    Role(int level) {
        this.level = level;
    }

    public Role getNextRole() {
        return switch (this) {
            case STUDENT -> LEADER;
            case LEADER -> PROFESSOR;
            case PROFESSOR -> ADMIN;
            case ADMIN -> null;
        };
    }

    public boolean canApprove(Role currentRole, Role requestedRole) {
        if (this == PROFESSOR) {
            // Professor can only approve STUDENT -> LEADER
            return currentRole == STUDENT && requestedRole == LEADER;
        } else if (this == ADMIN) {
            // Admin can approve any promotion (including to ADMIN)
            return requestedRole.level > currentRole.level;
        }
        // LEADER and STUDENT cannot approve
        return false;
    }
}
