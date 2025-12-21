package com.etjelesni.backend.repository;

import com.etjelesni.backend.model.Section;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SectionRepository extends JpaRepository<Section, Long> {
}
