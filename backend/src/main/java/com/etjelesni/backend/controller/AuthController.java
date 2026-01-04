package com.etjelesni.backend.controller;

import com.etjelesni.backend.model.Token;
import com.etjelesni.backend.service.TokenService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api")
public class AuthController {

    private final TokenService tokenService;

    @Value("${app.cookie.secure}")
    private boolean cookieSecure;

    @Value("${app.cookie.same-site}")
    private String cookieSameSite;

    public AuthController(TokenService tokenService) {
        this.tokenService = tokenService;
    }

    @GetMapping("/login")
    public ResponseEntity<Void> loginToMicrosoft() {
        URI microsoftLoginUri = URI.create("/oauth2/authorization/azure");
        return ResponseEntity.status(HttpStatus.FOUND).location(microsoftLoginUri).build();
    }

    @PostMapping("/auth/set-cookie")
    public ResponseEntity<Void> setCookie(@RequestParam Long tokenId, HttpServletResponse response) {
        // Get token from DB by ID
        Token token = tokenService.getTokenById(tokenId);

        if (token == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String jwt = token.getToken();

        // Set the cookie with environment-based settings
        ResponseCookie cookie = ResponseCookie.from("jwtToken", jwt)
                .path("/")
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(cookieSameSite)
                .maxAge(24 * 60 * 60)
                .build();

        response.addHeader("Set-Cookie", cookie.toString());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request,
                                       HttpServletResponse response) {

        // 1. Retrieve the JWT token from cookies and revoke it
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("jwtToken".equals(cookie.getName())) {
                    String token = cookie.getValue();
                    if (token != null && !token.isEmpty()) {
                        tokenService.revokeToken(token);
                    }
                } else {
                    // Remove any other cookies
                    cookie.setValue("");
                    cookie.setPath("/");
                    cookie.setMaxAge(0);
                    response.addCookie(cookie);
                }
            }
        }

        // 1.1 If a token was provided in the Authorization header, revoke it
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            tokenService.revokeToken(token);
        }

        // 2. Clear the JWT cookie using ResponseCookie with same settings as login
        ResponseCookie deleteCookie = ResponseCookie.from("jwtToken", "")
                .path("/")
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(cookieSameSite)
                .maxAge(0)
                .build();

        response.addHeader("Set-Cookie", deleteCookie.toString());

        // 3. Clear the Spring Security context
        SecurityContextHolder.clearContext();

        // 4. Invalidate the HTTP session (used for OAuth2 state)
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }

        return ResponseEntity.noContent().build();
    }

}
