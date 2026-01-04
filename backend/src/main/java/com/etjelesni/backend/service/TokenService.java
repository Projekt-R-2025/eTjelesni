package com.etjelesni.backend.service;

import com.etjelesni.backend.model.Token;
import com.etjelesni.backend.model.User;
import com.etjelesni.backend.repository.TokenRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class TokenService {

    private final TokenRepository tokenRepository;


    public Token saveToken(String jwt, User user) {
        Token token = new Token();
        token.setToken(jwt);
        token.setUser(user);
        return tokenRepository.save(token);
    }

    public Token getTokenById(Long tokenId) {
        return tokenRepository.findById(tokenId)
                .filter(token -> !token.isRevoked())
                .orElse(null);
    }

    public boolean isTokenRevoked(String jwt) {
        return tokenRepository.findByToken(jwt)
                .map(Token::isRevoked)
                .orElse(true);
    }

    public boolean isTokenValid(String jwt) {
        return tokenRepository.findByToken(jwt)
                .map(token -> !token.isRevoked())
                .orElse(false);
    }

    public void revokeToken(String jwt) {
        tokenRepository.findByToken(jwt).ifPresent(token -> {
            token.setRevoked(true);
            tokenRepository.save(token);
        });
    }

}
