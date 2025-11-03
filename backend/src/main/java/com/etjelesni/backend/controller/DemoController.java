package com.etjelesni.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class DemoController {

    @GetMapping("/hello")
    public Map<String, String> hello() {
        return Map.of("message", "Hello from the backend!");
    }

    //ovo je moja promjena bilo kaj samo da si nešto napravio
}
