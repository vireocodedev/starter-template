package com.vireocode.startertemplate.app.history;

import java.util.Optional;

import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import com.vireocode.vireo.auth.StarterUserRepository;
import com.vireocode.vireo.history.HistoryActor;
import com.vireocode.vireo.history.HistoryActorResolver;

/** Resolves history actors from this application's authenticated user store. */
@Component
final class AppHistoryActorResolver implements HistoryActorResolver {

    private final StarterUserRepository users;

    AppHistoryActorResolver(StarterUserRepository users) {
        this.users = users;
    }

    @Override
    public Optional<HistoryActor> resolveCurrentActor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            return Optional.empty();
        }

        String username = authentication.getName();
        if (username == null || username.isBlank()) {
            return Optional.empty();
        }

        return users.findByUsername(username)
                .map(user -> new HistoryActor(user.getId().toString(), user.getUsername()))
                .or(() -> Optional.of(new HistoryActor(null, username)));
    }
}
