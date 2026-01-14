package com.etjelesni.backend.repository;

import com.etjelesni.backend.enumeration.RequestStatus;
import com.etjelesni.backend.model.Application;
import com.etjelesni.backend.model.Section;
import com.etjelesni.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    boolean existsByApplicantAndSectionAndStatus(User applicant, Section requestedSection, RequestStatus status);
    List<Application> findByStatus(RequestStatus status);
    List<Application> findByApplicant(User applicant);
}
