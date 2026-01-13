package com.etjelesni.backend.mapper;

import com.etjelesni.backend.dto.attendance.AttendanceResponseDto;
import com.etjelesni.backend.model.Attendance;
import com.etjelesni.backend.model.Session;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface AttendanceMapper {

    @Mapping(target = "sessionId", source = "session.id")
    @Mapping(target = "studentId", source = "student.id")
    AttendanceResponseDto toResponseDto(Attendance attendance);

    List<AttendanceResponseDto> toResponseDtoList(List<Attendance> attendances);

    // ignore id so MapStruct doesn't copy session.id into attendance.id (prevents update)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "student", ignore = true) // set student in service
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "cancelled", ignore = true)
    @Mapping(target = "session", source = ".")
    Attendance toEntity(Session session);
}
