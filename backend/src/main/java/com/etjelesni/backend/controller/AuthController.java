package com.etjelesni.backend.controller;

import com.etjelesni.backend.service.TokenService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api")
public class AuthController {

    private final TokenService tokenService;

    public AuthController(TokenService tokenService) {
        this.tokenService = tokenService;
    }

    @GetMapping("/login")
    public ResponseEntity<Void> loginToMicrosoft() {
        URI microsoftLoginUri = URI.create("/oauth2/authorization/azure");
        return ResponseEntity.status(HttpStatus.FOUND).location(microsoftLoginUri).build();
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {

        // Retrieve the JWT token from Authorization header and revoke it
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            tokenService.revokeToken(token);
        }

        // Clear the Spring Security context
        SecurityContextHolder.clearContext();

        // Invalidate the HTTP session (used for OAuth2 state)
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }

        return ResponseEntity.noContent().build();
    }

}
