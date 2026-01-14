package com.etjelesni.backend.service;

import com.etjelesni.backend.dto.application.ApplicationCreateDto;
import com.etjelesni.backend.dto.application.ApplicationResponseDto;
import com.etjelesni.backend.dto.application.ApplicationReviewDto;
import com.etjelesni.backend.enumeration.RequestStatus;
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

        // Admin and professors can see all applications
        if (currentUser.isAdmin() || currentUser.isProfessor()) {
            List<Application> applications;

            if (status != null && !status.isBlank()) {
                RequestStatus queryParamStatus;
                try {
                    queryParamStatus = RequestStatus.valueOf(status.toUpperCase());
                } catch (IllegalArgumentException e) {
                    throw new IllegalArgumentException("Invalid query parameter status: " + status);
                }
                applications = applicationRepository.findByStatus(queryParamStatus);
            } else {
                applications = applicationRepository.findAll();
            }

            return applicationMapper.toResponseDtoList(applications);
        }

        // Section leaders can see applications for their sections
        List<Long> leadingSectionIds = currentUser.getLeadingSectionIds();
        if (leadingSectionIds != null && !leadingSectionIds.isEmpty()) {
            List<Application> applications = applicationRepository.findAll().stream()
                    .filter(app -> leadingSectionIds.contains(app.getSection().getId()))
                    .toList();

            if (status != null && !status.isBlank()) {
                RequestStatus queryParamStatus;
                try {
                    queryParamStatus = RequestStatus.valueOf(status.toUpperCase());
                } catch (IllegalArgumentException e) {
                    throw new IllegalArgumentException("Invalid query parameter status: " + status);
                }
                applications = applications.stream()
                        .filter(app -> app.getStatus() == queryParamStatus)
                        .toList();
            }

            return applicationMapper.toResponseDtoList(applications);
        }

        throw new AccessDeniedException("You do not have permission to view applications");
    }

    public List<ApplicationResponseDto> getMyApplications() {
        User applicant = currentUserService.getCurrentUser();
        List<Application> applications = applicationRepository.findByApplicant(applicant);
        return applicationMapper.toResponseDtoList(applications);
    }

    public ApplicationResponseDto createApplication(ApplicationCreateDto dto) {
        User applicant = userService.getUserOrThrow(dto.getUserId());
        Section requestedSection = sectionService.getSectionOrThrow(dto.getRequestedSectionId());

        // Prevent requesting the same section the user is already in
        if (applicant.getSection() != null && applicant.getSection().getId().equals(requestedSection.getId())) {
            throw new IllegalStateException("You are already assigned to this section");
        }

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

        // Check if the reviewer has permission (admin, professor, or section leader)
        boolean isLeaderOfSection = sectionService.isUserLeaderOfSection(reviewer, application.getSection());
        if (!(reviewer.isAdmin() || reviewer.isProfessor() || isLeaderOfSection)) {
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
        if (application.getApplicant().getId().equals(currentUser.getId())) {
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
