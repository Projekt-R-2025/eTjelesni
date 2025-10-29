package com.etjelesni.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;

@RestController
@RequestMapping("/api")
public class AuthController {

    @GetMapping("/login")
    public ResponseEntity<Void> loginToMicrosoft() {
        URI microsoftLoginUri = URI.create("/oauth2/authorization/azure");
        return ResponseEntity.status(HttpStatus.FOUND).location(microsoftLoginUri).build();
    }


}
