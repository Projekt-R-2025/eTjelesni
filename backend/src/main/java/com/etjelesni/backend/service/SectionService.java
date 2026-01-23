package com.etjelesni.backend.service;

import com.etjelesni.backend.dto.section.SectionCreateDto;
import com.etjelesni.backend.dto.section.SectionResponseDto;
import com.etjelesni.backend.dto.section.SectionUpdateDto;
import com.etjelesni.backend.exception.ResourceNotFoundException;
import com.etjelesni.backend.mapper.SectionMapper;
import com.etjelesni.backend.model.Section;
import com.etjelesni.backend.repository.SectionRepository;
import com.etjelesni.backend.service.permission.PermissionService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class SectionService {

    private final SectionMapper sectionMapper;
    private final SectionRepository sectionRepository;

    private final PermissionService permissionService;


    public List<SectionResponseDto> getAllSections() {
        List<Section> sections = sectionRepository.findAll();
        return sectionMapper.toResponseDtoList(sections);
    }

    public SectionResponseDto getSectionById(Long id) {
        Section section = getSectionOrThrow(id);
        return sectionMapper.toResponseDto(section);
    }

    public SectionResponseDto createSection(SectionCreateDto dto) {
        permissionService.requireCanManageSection();

        Section section = sectionMapper.toEntity(dto);
        sectionRepository.save(section);

        return sectionMapper.toResponseDto(section);
    }

    public SectionResponseDto updateSection(Long id, SectionUpdateDto dto) {
        permissionService.requireCanManageSection();

        Section section = getSectionOrThrow(id);
        if (dto.getName() != null) section.setName(dto.getName());
        if (dto.getSectionType() != null) section.setSectionType(dto.getSectionType());
        if (dto.getPassingPoints() != null) section.setPassingPoints(dto.getPassingPoints());
        Section updatedSection = sectionRepository.save(section);

        return sectionMapper.toResponseDto(updatedSection);
    }

    public void deleteSection(Long id) {
        permissionService.requireCanManageSection();

        Section section = getSectionOrThrow(id);

        sectionRepository.delete(section);
    }

    public Section getSectionOrThrow(Long id) {
        return sectionRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Section not found with id: " + id));
    }

}
