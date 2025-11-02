package com.etjelesni.backend.repository;

import com.etjelesni.backend.model.Token;
import com.etjelesni.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TokenRepository extends JpaRepository<Token, Long> {
    Optional<Token> findByToken(String token);
}
