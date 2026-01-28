package com.etjelesni.backend.service;

import com.etjelesni.backend.dto.user.UserCreateDto;
import com.etjelesni.backend.dto.user.UserResponseDto;
import com.etjelesni.backend.dto.user.UserUpdateDto;
import com.etjelesni.backend.enumeration.Role;
import com.etjelesni.backend.exception.UserNotFoundException;
import com.etjelesni.backend.mapper.UserMapper;
import com.etjelesni.backend.model.Section;
import com.etjelesni.backend.model.User;
import com.etjelesni.backend.repository.UserRepository;
import com.etjelesni.backend.service.auth.CurrentUserService;
import com.etjelesni.backend.service.permission.PermissionService;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@AllArgsConstructor
public class UserService {

    private final UserMapper userMapper;
    private final UserRepository userRepository;

    private final CurrentUserService currentUserService;
    private final PermissionService permissionService;
    private final SectionService sectionService;
    private final SectionLeaderService sectionLeaderService;


    @Transactional
    public UserResponseDto getCurrentUser() {
        User user = currentUserService.getCurrentUser();
        return userMapper.toResponseDto(user);
    }

    @Transactional
    public List<UserResponseDto> getAllUsers() {
        permissionService.requireCanManageUser();

        List<User> users = userRepository.findAll();
        return userMapper.toResponseDtoList(users);
    }

    @Transactional
    public List<UserResponseDto> getUsersBySectionId(Long sectionId) {
        Section section = sectionService.getSectionOrThrow(sectionId);
        //permissionService.requireCanViewSectionMembers(section);

        List<User> users = userRepository.findBySectionId(sectionId);
        return userMapper.toResponseDtoList(users);
    }

    @Transactional
    public UserResponseDto getUserById(Long id) {
        //permissionService.requireCanManageUser();

        User user = getUserOrThrow(id);
        return userMapper.toResponseDto(user);
    }

    @Transactional
    public UserResponseDto createUser(UserCreateDto dto) {
        permissionService.requireCanManageUser();

        User user = userMapper.toEntity(dto);
        user.setRole(Role.STUDENT);
        user.setCurrentPoints(0);
        user.setLeadingSectionIds(new ArrayList<>());
        userRepository.save(user);

        return userMapper.toResponseDto(user);
    }

    @Transactional
    public UserResponseDto updateUser(Long id, UserUpdateDto dto) {
        permissionService.requireCanManageUser();

        User user = getUserOrThrow(id);
        if (dto.getFirstName() != null) user.setFirstName(dto.getFirstName());
        if (dto.getLastName() != null) user.setLastName(dto.getLastName());
        User updatedUser = userRepository.save(user);

        return userMapper.toResponseDto(updatedUser);
    }

    @Transactional
    public void deleteUser(Long id) {
        permissionService.requireCanManageUser();

        User user = getUserOrThrow(id);
        userRepository.delete(user);
    }

    @Transactional
    public void resetAllStudentsPointsToZero() {
        permissionService.requireCanManageUser();

        userRepository.resetAllPoints();
    }

    @Transactional
    public void removeUserFromSection(Long userId) {
        User user = getUserOrThrow(userId);

        if (user.getSection() == null) {
            throw new IllegalStateException("User is not assigned to any section");
        }

        permissionService.requireCanRemoveUserFromSection(user.getSection());

        user.setSection(null);
        userRepository.save(user);
    }

    @Transactional
    public void removeUserAsLeaderFromSection(Long userId, Long sectionId) {
        permissionService.requireCanManageUser();

        User user = getUserOrThrow(userId);
        Section section = sectionService.getSectionOrThrow(sectionId);

        sectionLeaderService.removeLeaderFromSection(user, section);
    }

    public User getUserOrThrow(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new UserNotFoundException(id));
    }

    public void updateUserRole(User user, Role newRole) {
        user.setRole(newRole);
        userRepository.save(user);
    }

    public void updateUserSection(User user, Section newSection) {
        user.setSection(newSection);
        userRepository.save(user);
    }

    public void increasePoints(User user, Integer points) {
        int currentPoints = user.getCurrentPoints() != null ? user.getCurrentPoints() : 0;
        user.setCurrentPoints(currentPoints + points);
        userRepository.save(user);
    }

}
