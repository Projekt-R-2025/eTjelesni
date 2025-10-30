package com.etjelesni.backend.config;

import com.etjelesni.backend.model.User;
import com.etjelesni.backend.service.JwtService;
import com.etjelesni.backend.service.TokenService;
import com.etjelesni.backend.service.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.HandlerExceptionResolver;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final HandlerExceptionResolver handlerExceptionResolver;
    private final JwtService jwtService;
    private final UserService userService;
    private final TokenService tokenService;

    private static final List<String> PUBLIC_PATHS = List.of(
            "/api/hello",
            "/api/login",
            "/oauth2/authorization/**",
            "/login/oauth2/**"
    );

    public JwtAuthenticationFilter(
            HandlerExceptionResolver handlerExceptionResolver,
            JwtService jwtService,
            UserService userService,
            TokenService tokenService
    ) {
        this.handlerExceptionResolver = handlerExceptionResolver;
        this.jwtService = jwtService;
        this.userService = userService;
        this.tokenService = tokenService;
    }

    private boolean isPublic(HttpServletRequest request) {
        String path = request.getServletPath();
        for (String pattern : PUBLIC_PATHS) {
            if (pattern.endsWith("/**")) {
                String prefix = pattern.substring(0, pattern.length() - 3);
                if (path.startsWith(prefix)) return true;
            } else {
                if (path.equals(pattern)) return true;
            }
        }
        return false;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        // Skip token processing for public endpoints so tokens sent there are ignored
        if (isPublic(request)) {
            filterChain.doFilter(request, response);
            return;
        }
        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            final String jwt = authHeader.substring(7);
            final String userEmail = jwtService.extractUsername(jwt);

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (userEmail != null && authentication == null) {
                Optional<User> userOpt = userService.findByEmail(userEmail);

                if (userOpt.isEmpty()) {
                    handlerExceptionResolver.resolveException(request, response, null,
                            new UsernameNotFoundException("User not found"));
                    return;
                }

                User user = userOpt.get();

                if (jwtService.isTokenValid(jwt, user)) {
                    // CHECK: is token revoked
                    if (Boolean.TRUE.equals(tokenService.isTokenRevoked(jwt))) {
                        SecurityContextHolder.clearContext();
                        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token revoked");
                        return;
                    }

                    List<SimpleGrantedAuthority> authorities =
                            List.of(new SimpleGrantedAuthority(user.getRole().name()));

                    // Use lightweight principal (email) instead of the full User entity
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            user.getEmail(),
                            null,
                            authorities
                    );

                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }

            filterChain.doFilter(request, response);
        } catch (Exception exception) {
            handlerExceptionResolver.resolveException(request, response, null, exception);
        }
    }
}
