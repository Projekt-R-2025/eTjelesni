package com.etjelesni.backend.service;

import com.etjelesni.backend.model.Token;
import com.etjelesni.backend.repository.TokenRepository;
import org.springframework.stereotype.Service;

@Service
public class TokenService {

    private final TokenRepository tokenRepository;

    public TokenService(TokenRepository tokenRepository) {
        this.tokenRepository = tokenRepository;
    }

    public boolean isTokenRevoked(String jwt) {
        return tokenRepository.findByToken(jwt)
                .map(Token::isRevoked)
                .orElse(true);
    }

    public void revokeToken(String tokenValue) {
        tokenRepository.findByToken(tokenValue).ifPresent(token -> {
            token.setRevoked(true);
            tokenRepository.save(token);
        });
    }
}
