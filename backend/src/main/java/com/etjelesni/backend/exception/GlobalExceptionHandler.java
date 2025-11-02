package com.etjelesni.backend.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(InvalidTokenException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidTokenException(
            InvalidTokenException e,
            HttpServletRequest request) {
        HttpStatus status = HttpStatus.UNAUTHORIZED;
        Map<String, Object> body = buildErrorBody(status, e.getMessage(), request);
        return ResponseEntity.status(status).body(body);
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleUserNotFound(
            UserNotFoundException e,
            HttpServletRequest request) {
        HttpStatus status = HttpStatus.NOT_FOUND;
        Map<String, Object> body = buildErrorBody(status, e.getMessage(), request);
        return ResponseEntity.status(status).body(body);
    }

    // You can add more exception handlers here as needed

    private Map<String, Object> buildErrorBody(HttpStatus status, String message, HttpServletRequest request) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", message);
        body.put("timestamp", LocalDateTime.now());
        body.put("path", request.getRequestURI());
        return body;
    }

}
