package com.vireocode.startertemplate.app.history;

import java.util.Set;

import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import com.vireocode.vireo.history.HistoryReadAuthorizer;

/** Application-owned authorization for the sample Item history endpoint. */
@Component("historyReadAuthorizer")
final class AppHistoryReadAuthorizer implements HistoryReadAuthorizer {

    private static final Set<String> READABLE_ENTITIES = Set.of(AppHistoryEntityType.ITEM.name());

    @Override
    public boolean canRead(Authentication authentication, String entity, String entityId) {
        return authentication != null
                && authentication.isAuthenticated()
                && !(authentication instanceof AnonymousAuthenticationToken)
                && READABLE_ENTITIES.contains(entity)
                && entityId != null
                && !entityId.isBlank();
    }
}
