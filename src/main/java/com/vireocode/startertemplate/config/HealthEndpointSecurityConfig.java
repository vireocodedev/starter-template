package com.vireocode.startertemplate.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.vireocode.vireo.auth.StarterHttpSecurityCustomizer;

@Configuration
public class HealthEndpointSecurityConfig {

    @Bean
    StarterHttpSecurityCustomizer healthEndpointSecurityCustomizer() {
        return http -> http.authorizeHttpRequests(authorization -> authorization
                .requestMatchers("/actuator/health", "/actuator/health/**").permitAll());
    }
}
