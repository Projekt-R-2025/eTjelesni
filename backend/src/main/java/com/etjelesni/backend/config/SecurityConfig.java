package com.etjelesni.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final OAuth2LoginSuccessHandler oauth2LoginSuccessHandler;
    private final RestAuthenticationEntryPoint restAuthenticationEntryPoint;
    private final OAuth2AuthorizationRequestResolver authorizationRequestResolver;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;


    public SecurityConfig(
            OAuth2LoginSuccessHandler oauth2LoginSuccessHandler,
            RestAuthenticationEntryPoint restAuthenticationEntryPoint,
            OAuth2AuthorizationRequestResolver authorizationRequestResolver,
            JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.oauth2LoginSuccessHandler = oauth2LoginSuccessHandler;
        this.restAuthenticationEntryPoint = restAuthenticationEntryPoint;
        this.authorizationRequestResolver = authorizationRequestResolver;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())

                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/hello",
                                "/api/login",
                                "/api/logout",
                                "/oauth2/authorization/**",
                                "/login/oauth2/**").permitAll()
                        .anyRequest().authenticated()
                )

                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(restAuthenticationEntryPoint)
                )

                .oauth2Login(oauth2 -> oauth2
                        .authorizationEndpoint(auth -> auth.authorizationRequestResolver(authorizationRequestResolver))
                        .successHandler(oauth2LoginSuccessHandler)
                )

                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
