package com.etjelesni.backend.config;

import com.etjelesni.backend.model.Token;
import com.etjelesni.backend.model.User;
import com.etjelesni.backend.repository.TokenRepository;
import com.etjelesni.backend.service.UserService;
import com.etjelesni.backend.service.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserService userService;
    private final JwtService jwtService;
    private final TokenRepository tokenRepository;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public OAuth2LoginSuccessHandler(UserService userService, JwtService jwtService, TokenRepository tokenRepository) {
        this.userService = userService;
        this.jwtService = jwtService;
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

        // Redirect to frontend callback with user data as URL parameters
        String redirectUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/oauth/callback")
                .queryParam("token", jwtToken)
                .queryParam("id", user.getId())
                .queryParam("firstName", URLEncoder.encode(firstName != null ? firstName : "", StandardCharsets.UTF_8))
                .queryParam("lastName", URLEncoder.encode(lastName != null ? lastName : "", StandardCharsets.UTF_8))
                .queryParam("email", URLEncoder.encode(email, StandardCharsets.UTF_8))
                .queryParam("role", user.getRole().name())
                .build()
                .toUriString();

        response.sendRedirect(redirectUrl);
    }
}
