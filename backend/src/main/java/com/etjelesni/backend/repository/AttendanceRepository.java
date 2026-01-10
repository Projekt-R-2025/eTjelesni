package com.etjelesni.backend.repository;

import com.etjelesni.backend.model.Attendance;
import com.etjelesni.backend.model.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    // fetch session and section to avoid lazy init when mapping/serializing later
    /* @Query("select distinct a from Attendance a " +
            "join fetch a.session s " +
            "join fetch s.section sec " +
            "where sec.id = :sectionId")
    List<Attendance> findAllBySectionIdWithFetch(@Param("sectionId") Long sectionId); */

    List<Attendance> findAllBySession(Session session);
}
