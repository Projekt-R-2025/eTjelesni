package com.etjelesni.backend.service;

import com.etjelesni.backend.dto.user.UserCreateDto;
import com.etjelesni.backend.dto.user.UserResponseDto;
import com.etjelesni.backend.dto.user.UserUpdateDto;
import com.etjelesni.backend.enumeration.Role;
import com.etjelesni.backend.exception.UserNotFoundException;
import com.etjelesni.backend.mapper.UserMapper;
import com.etjelesni.backend.model.User;
import com.etjelesni.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserMapper userMapper;
    private final UserRepository userRepository;

    public UserService(UserMapper userMapper, UserRepository userRepository) {
        this.userMapper = userMapper;
        this.userRepository = userRepository;
    }

    public UserResponseDto getCurrentUser(User user) {
        return userMapper.toResponseDto(user);
    }

    public List<UserResponseDto> getAllUsers() {
        List<User> users = userRepository.findAll();
        return userMapper.toResponseDto(users);
    }

    public UserResponseDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
        return userMapper.toResponseDto(user);
    }

    public UserResponseDto createUser(UserCreateDto dto) {
        User user = userMapper.toEntity(dto);
        user.setRole(Role.STUDENT);
        userRepository.save(user);
        return userMapper.toResponseDto(user);
    }

    public UserResponseDto updateUser(Long id, UserUpdateDto dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));

        if (dto.getFirstName() != null) user.setFirstName(dto.getFirstName());
        if (dto.getLastName() != null) user.setLastName(dto.getLastName());

        User updatedUser = userRepository.save(user);
        return userMapper.toResponseDto(updatedUser);
    }

    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
        userRepository.delete(user);
    }

}
