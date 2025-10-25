package com.etjelesni.backend.service;

import com.etjelesni.backend.dto.AuthResponse;
import com.etjelesni.backend.model.User;
import com.etjelesni.backend.repository.UserRepository;
import com.etjelesni.backend.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Transactional
    public AuthResponse processOAuth2Login(OAuth2User oauth2User) {
        String email = oauth2User.getAttribute("userPrincipalName");
        String microsoftId = oauth2User.getAttribute("id");
        String displayName = oauth2User.getAttribute("displayName");

        // Razdvoji ime i prezime
        String[] nameParts = displayName != null ? displayName.split(" ", 2) : new String[]{"", ""};
        String ime = nameParts.length > 0 ? nameParts[0] : "";
        String prezime = nameParts.length > 1 ? nameParts[1] : "";

        // Pronađi ili kreiraj usera
        User user = userRepository.findByEmail(email)
                .map(existingUser -> {
                    // User postoji - updataj lastLogin
                    existingUser.setLastLogin(LocalDateTime.now());
                    if (existingUser.getMicrosoftId() == null) {
                        existingUser.setMicrosoftId(microsoftId);
                    }
                    return userRepository.save(existingUser);
                })
                .orElseGet(() -> {
                    // Novi user - kreiraj
                    User newUser = new User();
                    newUser.setFirstName(ime);
                    newUser.setLastName(prezime);
                    newUser.setEmail(email);
                    newUser.setMicrosoftId(microsoftId);
                    return userRepository.save(newUser);
                });

        // Generiraj JWT token
        String token = jwtUtil.generateToken(user.getEmail(), user.getId());

        return new AuthResponse(token, user.getId(), user.getEmail(), user.getFirstName(), user.getLastName());
    }
}
