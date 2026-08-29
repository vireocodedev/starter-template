package com.vireocode.startertemplate.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.vireocode.startertemplate.app.auth.AppUserRole;
import com.vireocode.vireo.auth.StarterUserRepository;

@Configuration
@Profile("deployment-smoke")
public class DeploymentSmokeBootstrapConfig {

    @Bean
    ApplicationRunner seedDeploymentSmokeIdentity(
            StarterUserRepository users,
            PasswordEncoder passwordEncoder,
            @Value("${vireo.deployment-smoke.username}") String username,
            @Value("${vireo.deployment-smoke.password}") String password) {
        return args -> DevBootstrapConfig.createUser(
                users,
                passwordEncoder,
                username,
                password,
                AppUserRole.SUPERADMIN);
    }
}
