package com.etjelesni.backend.service;


import com.etjelesni.backend.dto.attendance.AttendanceResponseDto;
import com.etjelesni.backend.enumeration.RequestStatus;
import com.etjelesni.backend.exception.ResourceNotFoundException;
import com.etjelesni.backend.mapper.AttendanceMapper;
import com.etjelesni.backend.model.Attendance;
import com.etjelesni.backend.model.Session;
import com.etjelesni.backend.repository.AttendanceRepository;
import com.etjelesni.backend.service.auth.CurrentUserService;
import com.etjelesni.backend.service.permission.PermissionService;
import lombok.AllArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class AttendanceService {

    private final AttendanceMapper attendanceMapper;
    private final AttendanceRepository attendanceRepository;

    private final CurrentUserService currentUserService;
    private final UserService userService;
    private final SessionService sessionService;
    private final PermissionService permissionService;


    public List<AttendanceResponseDto> getAllAttendances() {
        permissionService.requireCanViewAllAttendances();

        List<Attendance> attendances = attendanceRepository.findAllByCancelledFalseOrCancelledIsNull();
        return attendanceMapper.toResponseDtoList(attendances);
    }

    public AttendanceResponseDto getAttendanceById(Long attendanceId) {
        Attendance attendance = getAttendanceOrThrow(attendanceId);

        permissionService.requireCanViewAttendance(attendance);

        return attendanceMapper.toResponseDto(attendance);
    }

    public List<AttendanceResponseDto> getSessionAttendances(Long sessionId) {
        Session session = sessionService.getSessionOrThrow(sessionId);

        permissionService.requireCanViewSessionAttendances(session);

        List<Attendance> attendances = attendanceRepository.findAllBySessionAndNotCancelled(session);
        return attendanceMapper.toResponseDtoList(attendances); // safe because associations are initialized
    }

    public AttendanceResponseDto createAttendance(Long sessionId) {
        Session session = sessionService.getSessionOrThrow(sessionId);

        permissionService.requireCanCreateAttendance(session);

        Attendance attendance = attendanceMapper.toEntity(session);
        attendance.setStudent(currentUserService.getCurrentUser());
        attendance.setCancelled(false);
        attendanceRepository.save(attendance);

        return attendanceMapper.toResponseDto(attendance);
    }

    public AttendanceResponseDto cancelAttendance(Long id) {
        Attendance attendance = getAttendanceOrThrow(id);

        permissionService.requireCanCancelAttendance(attendance);

        // Check if already cancelled
        if (Boolean.TRUE.equals(attendance.getCancelled())) {
            throw new IllegalStateException("This attendance is already cancelled.");
        }

        // Only pending attendances can be cancelled
        if (attendance.getStatus() != RequestStatus.PENDING) {
            throw new IllegalStateException("Only pending attendance requests can be cancelled.");
        }

        attendance.setCancelled(true);

        Attendance updatedAttendance = attendanceRepository.save(attendance);
        return attendanceMapper.toResponseDto(updatedAttendance);
    }

    public AttendanceResponseDto approveAttendance(Long id) {
        Attendance attendance = getAttendanceOrThrow(id);

        permissionService.requireCanApproveAttendance(attendance);

        canChangeAttendanceStatus(attendance);

        attendance.setStatus(RequestStatus.APPROVED);
        int sessionPoints = attendance.getSession().getPoints();
        userService.increasePoints(attendance.getStudent(), sessionPoints);
        Attendance updatedAttendance = attendanceRepository.save(attendance);

        return attendanceMapper.toResponseDto(updatedAttendance);
    }

    public AttendanceResponseDto rejectAttendance(Long id) {
        Attendance attendance = getAttendanceOrThrow(id);

        permissionService.requireCanApproveAttendance(attendance);

        canChangeAttendanceStatus(attendance);

        attendance.setStatus(RequestStatus.REJECTED);
        Attendance updatedAttendance = attendanceRepository.save(attendance);

        return attendanceMapper.toResponseDto(updatedAttendance);
    }

    public Attendance getAttendanceOrThrow(Long id) {
        return attendanceRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Attendance not found with id: " + id));
    }

    public void canChangeAttendanceStatus(Attendance attendance) {
        if (attendance.getStatus() != RequestStatus.PENDING) {
            throw new IllegalStateException("Only pending attendance requests can be changed.");
        }
    }

}
