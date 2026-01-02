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
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.security.access.AccessDeniedException;

import java.util.List;

@Service
@AllArgsConstructor
public class SessionService {

    private final SessionMapper sessionMapper;
    private final SessionRepository sessionRepository;

    private final SectionService sectionService;
    private final CurrentUserService currentUserService;

    public List<SessionResponseDto> getAllSessions(Long sectionId) {
        Section section = sectionService.getSectionOrThrow(sectionId);

        List<Session> sessions = sessionRepository.findAllBySectionId(sectionId);
        return sessionMapper.toResponseDtoList(sessions);
    }

    public SessionResponseDto getSessionById(Long id) {
        Session session = getSessionOrThrow(id);
        return sessionMapper.toResponseDto(session);
    }

    public SessionResponseDto createSession(SessionCreateDto dto) {
        Session session = sessionMapper.toEntity(dto);

        Section section = sectionService.getSectionOrThrow(dto.getSectionId());
        session.setSection(section);

        sessionRepository.save(session);
        return sessionMapper.toResponseDto(session);
    }

    public void deleteSession(Long id) {
        Session session = getSessionOrThrow(id);
        User currentUser = currentUserService.getCurrentUser();
        if (currentUser.isProfessor() || currentUser.isAdmin()) {
            sessionRepository.deleteById(id);
            return;
        }
        throw new AccessDeniedException("You do not have permission to delete this session");
    }

    public Session getSessionOrThrow(Long id) {
        return sessionRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Session not found with id: " + id));
    }
}
