package com.etjelesni.backend.service;

import com.etjelesni.backend.dto.semester.SemesterCreateDto;
import com.etjelesni.backend.dto.semester.SemesterResponseDto;
import com.etjelesni.backend.dto.semester.SemesterUpdateDto;
import com.etjelesni.backend.enumeration.Role;
import com.etjelesni.backend.exception.ResourceNotFoundException;
import com.etjelesni.backend.exception.UserNotFoundException;
import com.etjelesni.backend.mapper.SemesterMapper;
import com.etjelesni.backend.model.RoleRequest;
import com.etjelesni.backend.model.Semester;
import com.etjelesni.backend.repository.SemesterRepository;
import com.etjelesni.backend.service.auth.CurrentUserService;
import lombok.AllArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import com.etjelesni.backend.model.User;

import java.util.List;

@Service
@AllArgsConstructor
public class SemesterService {

    private final SemesterMapper semesterMapper;
    private final SemesterRepository semesterRepository;
    
    private final CurrentUserService currentUserService;


     public List<SemesterResponseDto> getAllSemesters() {
        List<Semester> semesters = semesterRepository.findAll();
        return semesterMapper.toResponseDto(semesters);
    }

    public SemesterResponseDto getSemesterById(Long id) {
        Semester semester = getSemesterOrThrow(id);
        return semesterMapper.toResponseDto(semester);
    }

     public SemesterResponseDto createSemester(SemesterCreateDto dto) {
         Semester semester = semesterMapper.toEntity(dto);
         semesterRepository.save(semester);
        return semesterMapper.toResponseDto(semester);
    }

    public SemesterResponseDto updateSemester(Long id, SemesterUpdateDto dto) {
        Semester semester = getSemesterOrThrow(id);

        if (dto.getName() != null) semester.setName(dto.getName());
        if (dto.getStartDate() != null) semester.setStartDate(dto.getStartDate());
        if (dto.getEndDate() != null) semester.setEndDate(dto.getEndDate());

        Semester updatedSemester = semesterRepository.save(semester);
        return semesterMapper.toResponseDto(updatedSemester);
    }

    public void deleteSemester(Long id) {
        Semester semester = getSemesterOrThrow(id);
        User currentUser = currentUserService.getCurrentUser();
        if (currentUser.isProfessor() || currentUser.isAdmin()) {
            semesterRepository.deleteById(id);
            return;
        }
        throw new AccessDeniedException("You do not have permission to delete this semester");
    }

    public Semester getSemesterOrThrow(Long id) {
        return semesterRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Semester not found with id: " + id));
    }

}
