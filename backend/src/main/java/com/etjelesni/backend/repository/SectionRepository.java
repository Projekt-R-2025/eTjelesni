package com.etjelesni.backend.repository;


import com.etjelesni.backend.model.Section;
import com.etjelesni.backend.model.Semester;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SectionRepository extends JpaRepository<Section, Long> {
}
