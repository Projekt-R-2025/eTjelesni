package com.etjelesni.backend.service;

import com.etjelesni.backend.dto.application.ApplicationCreateDto;
import com.etjelesni.backend.dto.application.ApplicationResponseDto;
import com.etjelesni.backend.dto.application.ApplicationReviewDto;
import com.etjelesni.backend.enumeration.RequestStatus;
import com.etjelesni.backend.enumeration.Role;
import com.etjelesni.backend.exception.ResourceNotFoundException;
import com.etjelesni.backend.mapper.ApplicationMapper;
import com.etjelesni.backend.model.Application;
import com.etjelesni.backend.model.Section;
import com.etjelesni.backend.model.User;
import com.etjelesni.backend.repository.ApplicationRepository;
import com.etjelesni.backend.service.auth.CurrentUserService;
import lombok.AllArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@AllArgsConstructor
public class ApplicationService {

    private final ApplicationMapper applicationMapper;
    private final ApplicationRepository applicationRepository;

    private final CurrentUserService currentUserService;
    private final UserService userService;
    private final SectionService sectionService;


    public List<ApplicationResponseDto> getAllApplications(String status) {
        User currentUser = currentUserService.getCurrentUser();
        List<Application> applications;

        if (status != null && !status.isBlank()) {
            // attempt to convert string to enum
            RequestStatus queryParamStatus;
            try {
                queryParamStatus = RequestStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid query parameter status: " + status);
            }

            // filter by status
            //Admini i profesori mogu sve
            if (currentUser.isAdmin() || currentUser.isProfessor()) {
                applications = applicationRepository.findByStatus(queryParamStatus);
            }
            //ZASAD MICEM JER NE POSTOJI IS LEADER
            /* else if (currentUser.isLeader()) {
                applications = applicationRepository.findByStatusAndRequestedSection(queryParamStatus, Role.LEADER);
            }  */ else {
                throw new AccessDeniedException("You do not have permission to view role requests");
            }
        } else {
            // if there is no status parameter, return all
            if (currentUser.isAdmin() || currentUser.isProfessor()) {
                applications = applicationRepository.findAll();
            }
            //ISTO KAO GORE
            /* else if (currentUser.isProfessor()) {
                applications = applicationRepository.findByRequestedRole(Role.LEADER);
            } */ else {
                throw new AccessDeniedException("You do not have permission to view all role requests");
            }
        }

        return applicationMapper.toResponseDtoList(applications);
    }

    public List<ApplicationResponseDto> getMyApplications() {
        User applicant = currentUserService.getCurrentUser();
        List<Application> applications = applicationRepository.findByApplicant(applicant);
        return applicationMapper.toResponseDtoList(applications);
    }

    public ApplicationResponseDto createApplication(ApplicationCreateDto dto) {
        User applicant = userService.getUserOrThrow(dto.getUserId());
        Section requestedSection = sectionService.getSectionOrThrow(dto.getRequestedSectionId());


        // Prevent requesting the same section
        if (applicant.getSection() == requestedSection) {
            throw new IllegalStateException("You cannot request the same role you already have");
        }

        // Validate section requirement for LEADER role NEBITNO
        /* if (requestedRole == Role.LEADER) {
            if (dto.getRequestedSectionId() == null) {
                throw new IllegalArgumentException("Section ID is required when requesting LEADER role");
            }
            section = sectionService.getSectionOrThrow(dto.getRequestedSectionId());

            // Check if user is already a leader of this section
            if (sectionService.isUserLeaderOfSection(user, section)) {
                throw new IllegalStateException("You are already a leader of this section");
            }
        } else {
            if (dto.getRequestedSectionId() != null) {
                throw new IllegalArgumentException("Section ID should only be provided for LEADER role requests");
            }
        } */

        // Prevent multiple same pending requests
        if (applicationRepository.existsByApplicantAndSectionAndStatus(applicant, requestedSection, RequestStatus.PENDING)) {
            throw new IllegalStateException("You already have a pending request for the section: " + requestedSection.getName());
        }

        Application application = new Application();

        application.setApplicant(applicant);
        application.setSection(requestedSection);
        application.setReason(dto.getReason());
        application.setStatus(RequestStatus.PENDING);

        applicationRepository.save(application);
        return applicationMapper.toResponseDto(application);
    }

    public ApplicationResponseDto reviewApplication(Long id, RequestStatus status, ApplicationReviewDto dto) {
        User reviewer = currentUserService.getCurrentUser();
        Application application = getApplicationOrThrow(id);

        if (application.getStatus() != RequestStatus.PENDING) {
            throw new IllegalStateException("Only pending applications can be reviewed");
        }

        User requestUser = application.getApplicant();

        // Vidi je li reviewer admin ili profesor
        if (!(reviewer.isAdmin() || reviewer.isProfessor())) {
            throw new AccessDeniedException("You do not have permission to review this application");
        }

        // Update the role request status and review details
        application.setStatus(status);
        application.setReviewedBy(reviewer);
        application.setReviewedAt(LocalDateTime.now());
        application.setReviewNote(dto.getReviewNote());
        applicationRepository.save(application);

        // If approved, update the user's section
        if (status == RequestStatus.APPROVED) {
            userService.updateUserSection(requestUser, application.getSection());
        }

        return applicationMapper.toResponseDto(application);
    }

    public void deleteApplication(Long id) {
        Application application = getApplicationOrThrow(id);
        User currentUser = currentUserService.getCurrentUser();
        if (application.getApplicant().getId().equals(currentUser.getId()) || currentUser.isAdmin()) {
            applicationRepository.deleteById(id);
            return;
        }
        throw new AccessDeniedException("You do not have permission to delete this role request");
    }

    public Application getApplicationOrThrow(Long id) {
        return applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + id));
    }

}
