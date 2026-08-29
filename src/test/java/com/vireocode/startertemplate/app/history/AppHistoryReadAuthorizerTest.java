package com.vireocode.startertemplate.app.history;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

class AppHistoryReadAuthorizerTest {

    private final AppHistoryReadAuthorizer authorizer = new AppHistoryReadAuthorizer();

    @Test
    void permitsAuthenticatedItemHistoryOnly() {
        TestingAuthenticationToken authenticated = new TestingAuthenticationToken("user", "password", "ROLE_USER");

        assertThat(authorizer.canRead(authenticated, "ITEM", "42")).isTrue();
        assertThat(authorizer.canRead(authenticated, "OTHER", "42")).isFalse();
        assertThat(authorizer.canRead(authenticated, "ITEM", " ")).isFalse();
    }

    @Test
    void rejectsMissingAnonymousAndUnauthenticatedActors() {
        AnonymousAuthenticationToken anonymous = new AnonymousAuthenticationToken(
                "key", "anonymous", List.of(new SimpleGrantedAuthority("ROLE_ANONYMOUS")));
        TestingAuthenticationToken unauthenticated = new TestingAuthenticationToken("user", "password");
        unauthenticated.setAuthenticated(false);

        assertThat(authorizer.canRead(null, "ITEM", "42")).isFalse();
        assertThat(authorizer.canRead(anonymous, "ITEM", "42")).isFalse();
        assertThat(authorizer.canRead(unauthenticated, "ITEM", "42")).isFalse();
    }
}
