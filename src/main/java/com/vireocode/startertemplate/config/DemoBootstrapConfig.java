package com.vireocode.startertemplate.config;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.vireocode.startertemplate.app.auth.AppUserRole;
import com.vireocode.startertemplate.app.item.ItemRepository;
import com.vireocode.vireo.auth.StarterUserRepository;

@Configuration
@Profile("demo")
public class DemoBootstrapConfig {

    @Bean
    ApplicationRunner seedPublicDemoData(
            StarterUserRepository users,
            PasswordEncoder passwordEncoder,
            ItemRepository items) {
        return args -> {
            DevBootstrapConfig.createUser(users, passwordEncoder, "demo", "demo123", AppUserRole.USER);
            DevBootstrapConfig.seedItems(items);
        };
    }
}
