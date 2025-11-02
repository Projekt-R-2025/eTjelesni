package com.etjelesni.backend.service;

import com.etjelesni.backend.dto.UserDto;
import com.etjelesni.backend.model.User;
import com.etjelesni.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<UserDto> getAllUsers() {
        List<User> users = userRepository.findAll();
        return UserDto.fromList(users);
    }

    public UserDto createUser(User user) {
        User createdUser = userRepository.save(user);
        return UserDto.from(createdUser);
    }

}
