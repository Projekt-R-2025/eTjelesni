package com.etjelesni.backend.service;


import com.etjelesni.backend.dto.attendance.AttendanceResponseDto;
import com.etjelesni.backend.exception.ResourceNotFoundException;
import com.etjelesni.backend.mapper.AttendanceMapper;
import com.etjelesni.backend.model.Attendance;
import com.etjelesni.backend.model.Session;
import com.etjelesni.backend.repository.AttendanceRepository;
import com.etjelesni.backend.service.auth.CurrentUserService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class AttendanceService {

    private final AttendanceMapper attendanceMapper;
    private final AttendanceRepository attendanceRepository;

    private final CurrentUserService currentUserService;
    private final SessionService sessionService;


    public List<AttendanceResponseDto> getAllAttendances() {
        List<Attendance> attendances = attendanceRepository.findAll();
        return attendanceMapper.toResponseDtoList(attendances);
    }

    public AttendanceResponseDto getAttendanceById(Long attendanceId) {
        Attendance attendance = getAttendanceOrThrow(attendanceId);
        return attendanceMapper.toResponseDto(attendance);
    }

    public List<AttendanceResponseDto> getSessionAttendances(Long sessionId) {
        Session session = sessionService.getSessionOrThrow(sessionId);
        List<Attendance> attendances = attendanceRepository.findAllBySession(session);
        return attendanceMapper.toResponseDtoList(attendances); // safe because associations are initialized
    }

    public AttendanceResponseDto createAttendance(Long sessionId) {
        Session session = sessionService.getSessionOrThrow(sessionId);
        Attendance attendance = attendanceMapper.toEntity(session);

        attendance.setStudent(currentUserService.getCurrentUser());
        attendance.setCancelled(false);

        attendanceRepository.save(attendance);
        return attendanceMapper.toResponseDto(attendance);
    }

    public AttendanceResponseDto cancelAttendance(Long id) {
        Attendance attendance = getAttendanceOrThrow(id);

        if (attendance.getCancelled() == false) attendance.setCancelled(true);

        Attendance updatedAttendance = attendanceRepository.save(attendance);
        return attendanceMapper.toResponseDto(updatedAttendance);
    }

    public Attendance getAttendanceOrThrow(Long id) {
        return attendanceRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Attendance not found with id: " + id));
    }

}
