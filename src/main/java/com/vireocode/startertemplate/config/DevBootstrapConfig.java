package com.vireocode.startertemplate.config;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.vireocode.vireo.auth.StarterUser;
import com.vireocode.vireo.auth.StarterUserRepository;
import com.vireocode.startertemplate.app.auth.AppUserRole;
import com.vireocode.startertemplate.app.item.Item;
import com.vireocode.startertemplate.app.item.ItemRepository;
import com.vireocode.startertemplate.app.item.ItemStatus;

@Configuration
@Profile("dev")
public class DevBootstrapConfig {

    @Bean
    ApplicationRunner seedDevelopmentData(
            StarterUserRepository users,
            PasswordEncoder passwordEncoder,
            ItemRepository items) {
        return args -> {
            createUser(users, passwordEncoder, "demo", "demo123", AppUserRole.USER);
            createUser(users, passwordEncoder, "admin", "admin123", AppUserRole.SUPERADMIN);

            if (items.count() == 0) {
                items.save(item("Design system audit", "Review the application against current Vireo contracts.", 4,
                        ItemStatus.ACTIVE));
                items.save(item("Offline workflow", "Verify create and edit behavior after reconnecting.", 2,
                        ItemStatus.DRAFT));
                items.save(item("Legacy cleanup", "Remove the last application-owned compatibility component.", 0,
                        ItemStatus.ARCHIVED));
            }
        };
    }

    private static void createUser(StarterUserRepository users, PasswordEncoder encoder, String username,
            String password, AppUserRole role) {
        if (users.existsByUsername(username)) {
            return;
        }
        StarterUser user = new StarterUser();
        user.setUsername(username);
        user.setPasswordHash(encoder.encode(password));
        user.setRole(role.name());
        user.setEnabled(true);
        users.save(user);
    }

    private static Item item(String name, String description, int quantity, ItemStatus status) {
        Item item = new Item();
        item.setName(name);
        item.setDescription(description);
        item.setQuantity(quantity);
        item.setStatus(status);
        return item;
    }
}
