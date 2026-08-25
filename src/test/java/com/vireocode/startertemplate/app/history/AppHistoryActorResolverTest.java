package com.vireocode.startertemplate.app.history;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import com.vireocode.starter.auth.StarterUser;
import com.vireocode.starter.auth.StarterUserRepository;

class AppHistoryActorResolverTest {

    private final StarterUserRepository users = mock(StarterUserRepository.class);
    private final AppHistoryActorResolver resolver = new AppHistoryActorResolver(users);

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void resolvesTheStableApplicationUserIdentity() {
        UUID userId = UUID.fromString("affc0aa4-818e-4969-a1b4-efdde1c57e2a");
        StarterUser user = new StarterUser();
        user.setId(userId);
        user.setUsername("admin");
        when(users.findByUsername("admin")).thenReturn(Optional.of(user));
        authenticate("admin");

        assertThat(resolver.resolveCurrentActor()).hasValueSatisfying(actor -> {
            assertThat(actor.id()).isEqualTo(userId.toString());
            assertThat(actor.label()).isEqualTo("admin");
        });
    }

    @Test
    void preservesAnAuthenticatedExternalPrincipalWithoutInventingAnId() {
        when(users.findByUsername("external-user")).thenReturn(Optional.empty());
        authenticate("external-user");

        assertThat(resolver.resolveCurrentActor()).hasValueSatisfying(actor -> {
            assertThat(actor.id()).isNull();
            assertThat(actor.label()).isEqualTo("external-user");
        });
    }

    @Test
    void treatsAnAbsentAuthenticationAsSystemActivity() {
        assertThat(resolver.resolveCurrentActor()).isEmpty();
    }

    private static void authenticate(String username) {
        SecurityContextHolder.getContext().setAuthentication(
                UsernamePasswordAuthenticationToken.authenticated(username, null, List.of()));
    }
}
