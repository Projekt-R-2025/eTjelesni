package com.etjelesni.backend.controller;

import com.etjelesni.backend.dto.AuthResponse;
import com.etjelesni.backend.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @GetMapping("/oauth2/success")
    public void oauth2Success(@AuthenticationPrincipal OAuth2User oauth2User,
                              HttpServletResponse response) throws IOException {

        // Procesiraj OAuth2 login i generiraj JWT
        AuthResponse authResponse = authService.processOAuth2Login(oauth2User);

        // Redirect na frontend sa JWT tokenom
        String redirectUrl = String.format(
                "%s/auth/callback?token=%s&userId=%d&email=%s&ime=%s&prezime=%s",
                frontendUrl,
                authResponse.getToken(),
                authResponse.getUserId(),
                authResponse.getEmail(),
                authResponse.getFirstName(),
                authResponse.getLastName()
        );

        response.sendRedirect(redirectUrl);
    }

    @GetMapping("/me")
    public AuthResponse getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        // Ova metoda će biti zaštićena JWT filterom
        // Frontend šalje: Authorization: Bearer <token>
        // Token je već validiran u filteru, ovdje samo vraćamo podatke

        // Možeš dohvatiti trenutnog usera iz SecurityContext-a
        // ili parsirati token ponovno ako trebaš dodatne podatke

        return null; // TODO: implementiraj ako trebaš
    }
}
