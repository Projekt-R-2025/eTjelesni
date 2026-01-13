package com.etjelesni.backend.repository;

import com.etjelesni.backend.model.Attendance;
import com.etjelesni.backend.model.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    List<Attendance> findAllByCancelledFalseOrCancelledIsNull();

    @Query("SELECT a FROM Attendance a WHERE a.session = :session AND (a.cancelled = false OR a.cancelled IS NULL)")
    List<Attendance> findAllBySessionAndNotCancelled(@Param("session") Session session);
}
