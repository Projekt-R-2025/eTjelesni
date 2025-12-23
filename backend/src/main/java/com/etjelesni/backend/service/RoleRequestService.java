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
import com.etjelesni.backend.repository.RoleRequestRepository;
import com.etjelesni.backend.service.auth.CurrentUserService;
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

        return roleRequestMapper.toResponseDto(roleRequests);
    }

    public List<RoleRequestResponseDto> getMyRoleRequests() {
        User user = currentUserService.getCurrentUser();
        List<RoleRequest> roleRequests = roleRequestRepository.findByUser(user);
        return roleRequestMapper.toResponseDto(roleRequests);
    }

    public RoleRequestResponseDto createRoleRequest(RoleRequestCreateDto dto) {
        User user = userService.getUserOrThrow(dto.getUserId());

        if (user.getRole() == dto.getRequestedRole()) {
            throw new IllegalStateException("You cannot request the same role you already have");
        }

        Role requestedRole = dto.getRequestedRole();
        if (roleRequestRepository.existsByUserAndRequestedRoleAndStatus(user, requestedRole, RequestStatus.PENDING)) {
            throw new IllegalStateException("You already have a pending request for the role: " + requestedRole);
        }

        RoleRequest roleRequest = new RoleRequest();
        roleRequest.setUser(user);
        roleRequest.setRequestedRole(dto.getRequestedRole());
        roleRequest.setReason(dto.getReason());
        roleRequest.setStatus(RequestStatus.PENDING);
        roleRequestRepository.save(roleRequest);

        return roleRequestMapper.toResponseDto(roleRequest);
    }

    public RoleRequestResponseDto reviewRoleRequest(Long id, RequestStatus status, RoleRequestReviewDto dto) {
        User reviewer = currentUserService.getCurrentUser();
        RoleRequest roleRequest = getRoleRequestOrThrow(id);

        if (roleRequest.getStatus() != RequestStatus.PENDING) {
            throw new IllegalStateException("Only pending requests can be reviewed");
        }

        User requestUser = roleRequest.getUser();

        // Check if the reviewer has permission to approve/reject this request
        if (!reviewer.getRole().canApprove(requestUser.getRole(), roleRequest.getRequestedRole())) {
            throw new AccessDeniedException("You do not have permission to review this role request");
        }

        // Update the role request status and review details
        roleRequest.setStatus(status);
        roleRequest.setReviewedBy(reviewer);
        roleRequest.setReviewedAt(LocalDateTime.now());
        roleRequest.setReviewNote(dto.getReviewNote());
        roleRequestRepository.save(roleRequest);

        // If approved, update the user's role
        if (status == RequestStatus.APPROVED) {
            userService.updateUserRole(requestUser, roleRequest.getRequestedRole());
        }

        return roleRequestMapper.toResponseDto(roleRequest);
    }

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
