package com.etjelesni.backend.config;

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
import java.util.HashMap;
import java.util.Map;

@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserService userService;
    private final JwtService jwtService;
    private final ObjectMapper objectMapper;

    public OAuth2LoginSuccessHandler(UserService userService, JwtService jwtService, ObjectMapper objectMapper) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.objectMapper = objectMapper;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();

        String email = oauth2User.getAttribute("email");
        String lastName = oauth2User.getAttribute("family_name");

        String fullName = oauth2User.getAttribute("name");
        String firstName = fullName.replace(lastName, "").trim();

        var user = userService.createOrUpdateUser(email, firstName, lastName);
        String jwtToken = jwtService.generateToken(user);

        response.setStatus(HttpServletResponse.SC_OK);
        response.setContentType("application/json");

        Map<String, String> tokenResponse = new HashMap<>();
        tokenResponse.put("token", jwtToken);

        response.getWriter().write(objectMapper.writeValueAsString(tokenResponse));
    }
}
