package com.etjelesni.backend.service.auth;

import com.etjelesni.backend.enumeration.Role;
import com.etjelesni.backend.model.User;
import com.etjelesni.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    public CustomOAuth2UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    private final Logger log = LoggerFactory.getLogger(CustomOAuth2UserService.class);

    public User saveUser(OAuth2User oauth2User) {
        String email = oauth2User.getAttribute("email");

        Optional<User> user = userRepository.findByEmail(email);

        if (user.isEmpty()) {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setRole(Role.STUDENT);
            newUser.setFirstName(oauth2User.getAttribute("given_name"));
            newUser.setLastName(oauth2User.getAttribute("family_name"));
            newUser.setCurrentPoints(0);

            log.info("Creating new user with email: {}", email);

            return userRepository.save(newUser);
        }

        return user.get();
    }

}
