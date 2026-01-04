package com.etjelesni.backend.config;


import com.etjelesni.backend.model.Token;
import com.etjelesni.backend.model.User;
import com.etjelesni.backend.service.auth.CustomOAuth2UserService;
import com.etjelesni.backend.service.auth.JwtService;
import com.etjelesni.backend.service.TokenService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.IOException;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final CustomOAuth2UserService customOAuth2UserService;
    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final CustomAuthenticationEntryPoint customAuthenticationEntryPoint;
    private final TokenService tokenService;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    private final Logger log = LoggerFactory.getLogger(WebConfig.class);

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(frontendUrl));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setExposedHeaders(Arrays.asList("Set-Cookie", "Authorization"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Enable CORS with the configuration source
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // Disable CSRF because JWT tokens (stored in cookies) are validated on each request
                .csrf(csrf -> csrf.disable())

                // Configure URL authorization
                .authorizeHttpRequests(authorizeRequests ->
                        authorizeRequests
                                .requestMatchers("/api/hello", "/api/login", "/api/auth/set-cookie").permitAll()
                                .requestMatchers("/api/**").authenticated()
                                .anyRequest().permitAll()
                )

                // Set session management to stateless for REST APIs
                .sessionManagement(sessionManagement ->
                        sessionManagement.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // Set authentication provider
                .authenticationProvider(authenticationProvider)

                // Add JWT authentication filter before UsernamePasswordAuthenticationFilter
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)

                // Handle unauthorized requests using a custom AuthenticationEntryPoint
                .exceptionHandling(exceptionHandling ->
                        exceptionHandling.authenticationEntryPoint(customAuthenticationEntryPoint)
                )

                // Configure OAuth2 login
                .oauth2Login(oauth2Login ->
                        oauth2Login
                                .userInfoEndpoint(userInfoEndpoint ->
                                        userInfoEndpoint.userService(customOAuth2UserService)
                                )
                                .successHandler(this::oauth2AuthenticationSuccessHandler)
                )

                // Disable form login to prevent default login page
                .formLogin(formLogin -> formLogin.disable())

                // Allow logout
                .logout(logout -> logout.permitAll());

        return http.build();
    }

    private void oauth2AuthenticationSuccessHandler(HttpServletRequest request, HttpServletResponse response,
                                                    Authentication authentication) throws IOException {

        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();

        log.info("OAuth2 Authentication Successful, redirecting to frontend home");
        User user = customOAuth2UserService.saveUser(oauth2User);

        String email = user.getEmail();
        Long userId = user.getId();
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);

        String jwt = jwtService.generateToken(userDetails, userId);
        log.info("Generated JWT token");

        // Save the token to DB and get the ID
        Token savedToken = tokenService.saveToken(jwt, user);
        Long tokenId = savedToken.getId();

        // Send only the token ID (not the actual JWT) in URL for security
        String redirectUrl = frontendUrl + "/auth/callback?tokenId=" + tokenId;

        log.info("Redirecting to frontend with tokenId: [{}]", tokenId);
        response.sendRedirect(redirectUrl);
    }

}
