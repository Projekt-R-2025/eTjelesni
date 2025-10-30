package com.etjelesni.backend.controller;

import com.etjelesni.backend.service.TokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api")
public class AuthController {

    @Autowired
    private TokenService tokenService;

    @GetMapping("/login")
    public ResponseEntity<Void> loginToMicrosoft() {
        URI microsoftLoginUri = URI.create("/oauth2/authorization/azure");
        return ResponseEntity.status(HttpStatus.FOUND).location(microsoftLoginUri).build();
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestHeader(value = "Authorization") String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ") && authHeader.length() > 7) {
            String token = authHeader.substring(7);
            tokenService.revokeToken(token);
        }
        return ResponseEntity.noContent().build();
    }



}
