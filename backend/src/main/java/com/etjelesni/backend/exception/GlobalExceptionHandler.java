package com.etjelesni.backend.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(InvalidTokenException.class)
    public ResponseEntity<Map<String, Object>> handleUnauthorized(Exception e) {
        HttpStatus status = HttpStatus.UNAUTHORIZED;
        Map<String, Object> body = buildErrorBody(status, e.getMessage());
        return ResponseEntity.status(status).body(body);
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleUserNotFound(UserNotFoundException e) {
        HttpStatus status = HttpStatus.NOT_FOUND;
        Map<String, Object> body = buildErrorBody(status, e.getMessage());
        return ResponseEntity.status(status).body(body);
    }

    private Map<String, Object> buildErrorBody(HttpStatus status, String message) {
        return Map.of(
                "status", status.value(),
                "error", status.getReasonPhrase(),
                "message", message
        );
    }

}
