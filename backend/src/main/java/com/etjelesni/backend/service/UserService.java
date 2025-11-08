package com.etjelesni.backend.service;

import com.etjelesni.backend.dto.user.UserCreateDto;
import com.etjelesni.backend.dto.user.UserResponseDto;
import com.etjelesni.backend.dto.user.UserUpdateDto;
import com.etjelesni.backend.enumeration.Role;
import com.etjelesni.backend.exception.UserNotFoundException;
import com.etjelesni.backend.mapper.UserMapper;
import com.etjelesni.backend.model.User;
import com.etjelesni.backend.repository.UserRepository;
import com.etjelesni.backend.service.auth.CurrentUserService;
import lombok.AllArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class UserService {

    private final UserMapper userMapper;
    private final UserRepository userRepository;

    private final CurrentUserService currentUserService;


    public UserResponseDto getCurrentUser() {
        User user = currentUserService.getCurrentUser();
        return userMapper.toResponseDto(user);
    }

    public List<UserResponseDto> getAllUsers() {
        List<User> users = userRepository.findAll();
        return userMapper.toResponseDto(users);
    }

    public UserResponseDto getUserById(Long id) {
        User user = getUserOrThrow(id);
        return userMapper.toResponseDto(user);
    }

    public UserResponseDto createUser(UserCreateDto dto) {
        User user = userMapper.toEntity(dto);
        user.setRole(Role.STUDENT);
        userRepository.save(user);
        return userMapper.toResponseDto(user);
    }

    public UserResponseDto updateUser(Long id, UserUpdateDto dto) {
        User user = getUserOrThrow(id);

        if (dto.getFirstName() != null) user.setFirstName(dto.getFirstName());
        if (dto.getLastName() != null) user.setLastName(dto.getLastName());

        User updatedUser = userRepository.save(user);
        return userMapper.toResponseDto(updatedUser);
    }

    public void deleteUser(Long id) {
        User user = getUserOrThrow(id);
        User currentUser = currentUserService.getCurrentUser();
        if (user.getId().equals(currentUser.getId()) || currentUser.isAdmin()) {
            userRepository.deleteById(id);
            return;
        }
        throw new AccessDeniedException("You do not have permission to delete this user");
    }

    public User getUserOrThrow(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new UserNotFoundException(id));
    }

    public void updateUserRole(User user, Role newRole) {
        user.setRole(newRole);
        userRepository.save(user);
    }

}
