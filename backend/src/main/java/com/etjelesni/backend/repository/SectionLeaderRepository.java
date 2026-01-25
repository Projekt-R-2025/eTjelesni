package com.etjelesni.backend.repository;

import com.etjelesni.backend.model.Section;
import com.etjelesni.backend.model.SectionLeader;
import com.etjelesni.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SectionLeaderRepository extends JpaRepository<SectionLeader, Long> {
    boolean existsByLeaderAndSection(User leader, Section section);
    Optional<SectionLeader> findByLeaderAndSection(User leader, Section section);
}

