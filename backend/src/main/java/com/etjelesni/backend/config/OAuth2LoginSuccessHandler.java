package com.etjelesni.backend.config;

import com.etjelesni.backend.dto.LoginResponse;
import com.etjelesni.backend.model.Token;
import com.etjelesni.backend.model.User;
import com.etjelesni.backend.repository.TokenRepository;
import com.etjelesni.backend.service.UserService;
import com.etjelesni.backend.service.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;

@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserService userService;
    private final JwtService jwtService;
    private final ObjectMapper objectMapper;
    private final TokenRepository tokenRepository;

    public OAuth2LoginSuccessHandler(UserService userService, JwtService jwtService, ObjectMapper objectMapper, TokenRepository tokenRepository) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.objectMapper = objectMapper;
        this.tokenRepository = tokenRepository;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();

        String email = oauth2User.getAttribute("email");
        String firstName = oauth2User.getAttribute("given_name");
        String lastName = oauth2User.getAttribute("family_name");

        User user = userService.createOrGetUser(email, firstName, lastName);
        String jwtToken = jwtService.generateToken(user);

        // Save the new token
        Token token = new Token();
        token.setToken(jwtToken);
        token.setUser(user);
        tokenRepository.save(token);

        LoginResponse loginResponse = new LoginResponse(user.getId(), user.getFirstName(), user.getLastName(),
                user.getEmail(), user.getRole().name(), jwtToken);

        response.setStatus(HttpServletResponse.SC_OK);
        response.setContentType("application/json");
        response.setCharacterEncoding("utf-8");
        objectMapper.writeValue(response.getWriter(), loginResponse);
    }
}
