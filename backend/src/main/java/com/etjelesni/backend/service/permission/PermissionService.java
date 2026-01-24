package com.etjelesni.backend.service.permission;

import com.etjelesni.backend.enumeration.NotificationType;
import com.etjelesni.backend.enumeration.Role;
import com.etjelesni.backend.model.*;
import com.etjelesni.backend.service.SectionLeaderService;
import com.etjelesni.backend.service.auth.CurrentUserService;
import lombok.AllArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Service
@AllArgsConstructor
public class PermissionService {

    private final CurrentUserService currentUserService;
    private final SectionLeaderService sectionLeaderService;


    // ============================================
    // NOTIFICATION PERMISSION METHODS
    // ============================================

    public void requireCanCreateGeneralNotification() {
        User currentUser = getCurrentUser();
        require(isProfessor(currentUser) ||
                isAdmin(currentUser));
    }

    public void requireCanCreateSectionNotification(Section section) {
        User currentUser = getCurrentUser();
        require(isSectionLeader(currentUser, section) ||
                isProfessor(currentUser) ||
                isAdmin(currentUser));
    }

    public void requireCanManageNotification(Notification notification) {
        User currentUser = getCurrentUser();
        if (notification.getType() == NotificationType.GENERAL) {
            require(isProfessor(currentUser) ||
                    isAdmin(currentUser));
        } else {
            require(isSectionLeader(currentUser, notification.getSection()) ||
                    isProfessor(currentUser) ||
                    isAdmin(currentUser));
        }
    }

    // ============================================
    // SESSION PERMISSION METHODS
    // ============================================

    public void requireCanManageSession(Section section) {
        User currentUser = getCurrentUser();
        require(isSectionLeader(currentUser, section) ||
                isProfessor(currentUser) ||
                isAdmin(currentUser));
    }

    // ============================================
    // SECTION PERMISSION METHODS
    // ============================================

    public void requireCanManageSection() {
        User currentUser = getCurrentUser();
        require(isProfessor(currentUser) ||
                isAdmin(currentUser));
    }

    // ============================================
    // ATTENDANCE PERMISSION METHODS
    // ============================================

    public void requireCanViewAllAttendances() {
        User currentUser = getCurrentUser();
        require(isProfessor(currentUser) ||
                isAdmin(currentUser));
    }

    public void requireCanViewAttendance(Attendance attendance) {
        User currentUser = getCurrentUser();
        require(isOwner(currentUser, attendance.getStudent()) ||
                isSectionLeader(currentUser, attendance.getSession().getSection()) ||
                isProfessor(currentUser) ||
                isAdmin(currentUser));
    }

    public void requireCanViewSessionAttendances(Session session) {
        User currentUser = getCurrentUser();
        require(isSectionLeader(currentUser, session.getSection()) ||
                isProfessor(currentUser) ||
                isAdmin(currentUser));
    }

    public void requireCanCreateAttendance(Session session) {
        User currentUser = getCurrentUser();
        require(isSectionMember(currentUser, session.getSection()));
    }

    public void requireCanCancelAttendance(Attendance attendance) {
        User currentUser = getCurrentUser();
        require(isOwner(currentUser, attendance.getStudent()));
    }

    public void requireCanApproveAttendance(Attendance attendance) {
        User currentUser = getCurrentUser();
        require(isSectionLeader(currentUser, attendance.getSession().getSection()) ||
                isProfessor(currentUser) ||
                isAdmin(currentUser));
    }

    // ============================================
    // USER PERMISSION METHODS
    // ============================================

    public void requireCanManageUser() {
        User currentUser = getCurrentUser();
        require(isProfessor(currentUser) ||
                isAdmin(currentUser));
    }

    public void requireCanViewSectionMembers(Section section) {
        User currentUser = getCurrentUser();
        require(isSectionLeader(currentUser, section) ||
                isProfessor(currentUser) ||
                isAdmin(currentUser));
    }



    // ============================================
    // CHECK HELPERS
    // ============================================

    private boolean isAdmin(User currentUser) {
        return currentUser.getRole() == Role.ADMIN;
    }

    private boolean isProfessor(User currentUser) {
        return currentUser.getRole() == Role.PROFESSOR;
    }

    private boolean isSectionLeader(User currentUser, Section section) {
        return sectionLeaderService.isUserLeaderOfSection(currentUser, section);
    }

    private boolean isSectionMember(User currentUser, Section section) {
        return currentUser.getSection() != null && Objects.equals(currentUser.getSection().getId(), section.getId());
    }

    private boolean isOwner(User currentUser, User user) {
        return Objects.equals(currentUser.getId(), user.getId());
    }

    private void require(boolean condition) {
        if (!condition) denyAccess();
    }

    private void denyAccess() {
        throw new AccessDeniedException("You do not have permission to perform this action");
    }

    private User getCurrentUser() {
        return currentUserService.getCurrentUser();
    }

}
