package com.etjelesni.backend.repository;

import com.etjelesni.backend.model.Section;
import com.etjelesni.backend.model.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

public interface SessionRepository extends JpaRepository<Session, Long> {
    List<Session> findAllBySectionId(Long sectionId);
}
