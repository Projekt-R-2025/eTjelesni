package com.etjelesni.backend.exception;

public class UserNotFoundException extends RuntimeException {

    public UserNotFoundException(Long userId) {
        super("User not found with id: " + userId);
    }

    public UserNotFoundException(String email) {
        super("User not found with email: " + email);
    }

}
