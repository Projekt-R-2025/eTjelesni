package com.etjelesni.backend.service;

import com.etjelesni.backend.dto.section.SectionCreateDto;
import com.etjelesni.backend.dto.section.SectionResponseDto;
import com.etjelesni.backend.dto.section.SectionUpdateDto;
import com.etjelesni.backend.exception.ResourceNotFoundException;
import com.etjelesni.backend.mapper.SectionMapper;
import com.etjelesni.backend.model.Section;
import com.etjelesni.backend.model.Semester;
import com.etjelesni.backend.model.User;
import com.etjelesni.backend.repository.SectionRepository;
import com.etjelesni.backend.service.auth.CurrentUserService;
import lombok.AllArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class SectionService {

    private final SectionMapper sectionMapper;
    private final SectionRepository sectionRepository;

    private final CurrentUserService currentUserService;
    private final SemesterService semesterService;

    public List<SectionResponseDto> getAllSections() {
        List<Section> sections = sectionRepository.findAll();
        return sectionMapper.toResponseDto(sections);
    }

    public SectionResponseDto getSectionById(Long id) {
        Section section = getSectionOrThrow(id);
        return sectionMapper.toResponseDto(section);
    }

    public SectionResponseDto createSection(SectionCreateDto dto) {
        Section section = sectionMapper.toEntity(dto);

        Semester semester = semesterService.getSemesterOrThrow(dto.getSemesterId());
        section.setSemester(semester);

        sectionRepository.save(section);
        return sectionMapper.toResponseDto(section);
    }

    public SectionResponseDto updateSection(Long id, SectionUpdateDto dto) {
        Section section = getSectionOrThrow(id);

        if (dto.getName() != null) section.setName(dto.getName());
        if (dto.getPassingPoints() != null) section.setPassingPoints(dto.getPassingPoints());

        Section updatedSection = sectionRepository.save(section);

        return sectionMapper.toResponseDto(updatedSection);
    }

    public void deleteSection(Long id) {
        User currentUser = currentUserService.getCurrentUser();
        if (currentUser.isProfessor() || currentUser.isAdmin()) {
            sectionRepository.deleteById(id);
            return;
        }
        throw new AccessDeniedException("You do not have permission to delete this section");
    }

    private Section getSectionOrThrow(Long id) {
        return sectionRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Section not found with id: " + id));
    }

}

