package com.etjelesni.backend.service;

import com.etjelesni.backend.dto.role_request.RoleRequestCreateDto;
import com.etjelesni.backend.dto.role_request.RoleRequestResponseDto;
import com.etjelesni.backend.dto.role_request.RoleRequestReviewDto;
import com.etjelesni.backend.enumeration.RequestStatus;
import com.etjelesni.backend.enumeration.Role;
import com.etjelesni.backend.exception.ResourceNotFoundException;
import com.etjelesni.backend.mapper.RoleRequestMapper;
import com.etjelesni.backend.model.RoleRequest;
import com.etjelesni.backend.model.User;
import com.etjelesni.backend.model.Section;
import com.etjelesni.backend.repository.RoleRequestRepository;
import com.etjelesni.backend.service.auth.CurrentUserService;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@AllArgsConstructor
public class RoleRequestService {

    private final RoleRequestMapper roleRequestMapper;
    private final RoleRequestRepository roleRequestRepository;

    private final CurrentUserService currentUserService;
    private final UserService userService;
    private final SectionService sectionService;
    private final SectionLeaderService sectionLeaderService;


    @Transactional
    public List<RoleRequestResponseDto> getAllRoleRequests(String status) {
        User currentUser = currentUserService.getCurrentUser();
        List<RoleRequest> roleRequests;

        if (status != null && !status.isBlank()) {
            // attempt to convert string to enum
            RequestStatus queryParamStatus;
            try {
                queryParamStatus = RequestStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid query parameter status: " + status);
            }

            // filter by status
            if (currentUser.isAdmin()) {
                roleRequests = roleRequestRepository.findByStatus(queryParamStatus);
            } else if (currentUser.isProfessor()) {
                roleRequests = roleRequestRepository.findByStatusAndRequestedRole(queryParamStatus, Role.LEADER);
            } else {
                throw new AccessDeniedException("You do not have permission to view role requests");
            }
        } else {
            // if there is no status parameter, return all
            if (currentUser.isAdmin()) {
                roleRequests = roleRequestRepository.findAll();
            } else if (currentUser.isProfessor()) {
                roleRequests = roleRequestRepository.findByRequestedRole(Role.LEADER);
            } else {
                throw new AccessDeniedException("You do not have permission to view all role requests");
            }
        }

        return roleRequestMapper.toResponseDtoList(roleRequests);
    }

    @Transactional
    public List<RoleRequestResponseDto> getMyRoleRequests() {
        User user = currentUserService.getCurrentUser();
        List<RoleRequest> roleRequests = roleRequestRepository.findByUser(user);
        return roleRequestMapper.toResponseDtoList(roleRequests);
    }

    @Transactional
    public RoleRequestResponseDto createRoleRequest(RoleRequestCreateDto dto) {
        User user = userService.getUserOrThrow(dto.getUserId());
        Role requestedRole = dto.getRequestedRole();

        // Prevent requesting the same role (except LEADER which can be for multiple sections)
        if (user.getRole() == requestedRole && requestedRole != Role.LEADER) {
            throw new IllegalStateException("Ne možete zatražiti istu ulogu koju već imate");
        }

        // Validate section requirement for LEADER role
        Section section = null;
        if (requestedRole == Role.LEADER) {
            if (dto.getRequestedSectionId() == null) {
                throw new IllegalArgumentException("ID sekcije je obavezan prilikom traženja uloge voditelja");
            }
            section = sectionService.getSectionOrThrow(dto.getRequestedSectionId());

            // Check if user is already a leader of this section
            if (sectionLeaderService.isUserLeaderOfSection(user, section)) {
                throw new IllegalStateException("Već ste voditelj sekcije " + section.getName());
            }
        } else {
            if (dto.getRequestedSectionId() != null) {
                throw new IllegalArgumentException("ID sekcije treba biti naveden samo za zahtjeve za ulogu voditelja");
            }
        }

        // Prevent multiple same pending requests
        if (requestedRole == Role.LEADER) {
            if (roleRequestRepository.existsByUserAndRequestedRoleAndRequestedSectionAndStatus(
                    user, requestedRole, section, RequestStatus.PENDING)) {
                throw new IllegalStateException("Već imate zahtjev na čekanju za ulogu voditelja za sekciju " + section.getName());
            }
        } else {
            if (roleRequestRepository.existsByUserAndRequestedRoleAndStatus(user, requestedRole, RequestStatus.PENDING)) {
                throw new IllegalStateException("Već imate zahtjev na čekanju za ulogu: " + requestedRole);
            }
        }

        RoleRequest roleRequest = new RoleRequest();

        roleRequest.setUser(user);
        roleRequest.setRequestedRole(dto.getRequestedRole());
        roleRequest.setReason(dto.getReason());
        roleRequest.setStatus(RequestStatus.PENDING);
        if (requestedRole == Role.LEADER) {
            roleRequest.setRequestedSection(section);
        }

        roleRequestRepository.save(roleRequest);
        return roleRequestMapper.toResponseDto(roleRequest);
    }

    @Transactional
    public RoleRequestResponseDto reviewRoleRequest(Long id, RequestStatus status, RoleRequestReviewDto dto) {
        User reviewer = currentUserService.getCurrentUser();
        RoleRequest roleRequest = getRoleRequestOrThrow(id);

        if (roleRequest.getStatus() != RequestStatus.PENDING) {
            throw new IllegalStateException("Samo zahtjevi na čekanju mogu biti pregledani");
        }

        User requestUser = roleRequest.getUser();

        // Check if the reviewer has permission to approve/reject this request
        if (!reviewer.getRole().canApprove(requestUser.getRole(), roleRequest.getRequestedRole())) {
            throw new AccessDeniedException("Nemate dozvolu za pregled ovog zahtjeva za ulogu");
        }

        // Update the role request status and review details
        roleRequest.setStatus(status);
        roleRequest.setReviewedBy(reviewer);
        roleRequest.setReviewedAt(LocalDateTime.now());
        roleRequest.setReviewNote(dto.getReviewNote());
        roleRequestRepository.save(roleRequest);

        // If approved, update the user's role
        if (status == RequestStatus.APPROVED) {
            if (roleRequest.getRequestedRole() == Role.LEADER) {
                sectionLeaderService.assignLeaderToSection(requestUser, roleRequest.getRequestedSection());
            }
            userService.updateUserRole(requestUser, roleRequest.getRequestedRole());
        }

        return roleRequestMapper.toResponseDto(roleRequest);
    }

    @Transactional
    public void deleteRoleRequest(Long id) {
        RoleRequest roleRequest = getRoleRequestOrThrow(id);
        User currentUser = currentUserService.getCurrentUser();
        if (roleRequest.getUser().getId().equals(currentUser.getId()) || currentUser.isAdmin()) {
            roleRequestRepository.deleteById(id);
            return;
        }
        throw new AccessDeniedException("You do not have permission to delete this role request");
    }

    public RoleRequest getRoleRequestOrThrow(Long id) {
        return roleRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role request not found with id: " + id));
    }

}
