package com.etjelesni.backend.service;

import com.etjelesni.backend.dto.session.SessionCreateDto;
import com.etjelesni.backend.dto.session.SessionResponseDto;
import com.etjelesni.backend.exception.ResourceNotFoundException;
import com.etjelesni.backend.mapper.SessionMapper;
import com.etjelesni.backend.model.Section;
import com.etjelesni.backend.model.Session;
import com.etjelesni.backend.model.User;
import com.etjelesni.backend.repository.SessionRepository;
import com.etjelesni.backend.service.auth.CurrentUserService;
import com.etjelesni.backend.service.permission.PermissionService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@AllArgsConstructor
public class SessionService {

    private final SessionMapper sessionMapper;
    private final SessionRepository sessionRepository;

    private final SectionService sectionService;
    private final PermissionService permissionService;


    @Transactional
    public List<SessionResponseDto> getAllSessionsBySection(Long sectionId) {
        Section section = sectionService.getSectionOrThrow(sectionId);
        List<Session> sessions = sessionRepository.findAllBySectionId(sectionId);
        return sessionMapper.toResponseDtoList(sessions);
    }

    @Transactional
    public List<SessionResponseDto> getAllSessions() {
        List<Session> sessions = sessionRepository.findAll();
        return sessionMapper.toResponseDtoList(sessions);
    }

    @Transactional
    public SessionResponseDto getSessionById(Long id) {
        Session session = getSessionOrThrow(id);
        return sessionMapper.toResponseDto(session);
    }

    @Transactional
    public SessionResponseDto createSession(SessionCreateDto dto) {
        Section section = sectionService.getSectionOrThrow(dto.getSectionId());

        //permissionService.requireCanManageSession(section);

        Session session = sessionMapper.toEntity(dto);
        session.setSection(section);
        sessionRepository.save(session);

        return sessionMapper.toResponseDto(session);
    }

    @Transactional
    public void deleteSession(Long id) {
        Session session = getSessionOrThrow(id);

        //permissionService.requireCanManageSession(session.getSection());

        sessionRepository.delete(session);
    }

    public Session getSessionOrThrow(Long id) {
        return sessionRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Session not found with id: " + id));
    }

}
