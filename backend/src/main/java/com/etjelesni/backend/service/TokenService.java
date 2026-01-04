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


    public void saveToken(String jwt, User user) {
        Token token = new Token();
        token.setToken(jwt);
        token.setUser(user);
        tokenRepository.save(token);
    }

    public boolean isTokenRevoked(String jwt) {
        return tokenRepository.findByToken(jwt)
                .map(Token::isRevoked)
                .orElse(true);
    }

    public void revokeToken(String jwt) {
        tokenRepository.findByToken(jwt).ifPresent(token -> {
            token.setRevoked(true);
            tokenRepository.save(token);
        });
    }

}
