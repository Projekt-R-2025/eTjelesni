package com.etjelesni.backend.controller;

import com.etjelesni.backend.dto.user.UserCreateDto;
import com.etjelesni.backend.dto.user.UserResponseDto;
import com.etjelesni.backend.dto.user.UserUpdateDto;
import com.etjelesni.backend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponseDto> getCurrentUser() {
        UserResponseDto response = userService.getCurrentUser();
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<UserResponseDto>> getAllUsers() {
        List<UserResponseDto> response = userService.getAllUsers();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/section/{sectionId}")
    public ResponseEntity<List<UserResponseDto>> getUsersBySectionId(@PathVariable Long sectionId) {
        List<UserResponseDto> response = userService.getUsersBySectionId(sectionId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDto> getUserById(@PathVariable Long id) {
        UserResponseDto response = userService.getUserById((id));
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<UserResponseDto> createUser(@RequestBody UserCreateDto dto) {
        UserResponseDto response = userService.createUser(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

//    @PutMapping("/{id}")
//    public ResponseEntity<UserResponseDto> updateUser(@PathVariable Long id, @RequestBody UserUpdateDto dto) {
//        UserResponseDto response = userService.updateUser(id, dto);
//        return ResponseEntity.ok(response);
//    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/points/reset")
    public ResponseEntity<Void> resetAllStudentsPointsToZero() {
        userService.resetAllStudentsPointsToZero();
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{userId}/section")
    public ResponseEntity<Void> removeUserFromSection(@PathVariable Long userId) {
        userService.removeUserFromSection(userId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{userId}/section/{sectionId}/leader")
    public ResponseEntity<Void> removeUserAsLeaderFromSection(
            @PathVariable Long userId,
            @PathVariable Long sectionId) {
        userService.removeUserAsLeaderFromSection(userId, sectionId);
        return ResponseEntity.noContent().build();
    }

}
