package com.etjelesni.backend.service;

import com.etjelesni.backend.enumeration.Role;
import com.etjelesni.backend.exception.UserNotFoundException;
import com.etjelesni.backend.model.User;
import com.etjelesni.backend.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class CurrentUserService {

    private UserRepository userRepository;

    public CurrentUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("User is not authenticated");
        }

        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException(email));
    }

    public boolean hasRole(Role role) {
        try {
            User user = getCurrentUser();
            return user.getRole() == role;
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isAdmin() {
        return hasRole(Role.ADMIN);
    }

}
