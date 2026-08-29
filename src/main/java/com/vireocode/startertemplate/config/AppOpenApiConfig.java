package com.vireocode.startertemplate.config;

import java.util.List;

import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.Operation;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;

@Configuration(proxyBeanMethods = false)
public class AppOpenApiConfig {

    static final String SESSION_COOKIE = "sessionCookie";
    static final String CSRF_TOKEN = "csrfToken";

    @Bean
    OpenAPI applicationOpenApi() {
        return new OpenAPI().components(new Components()
                .addSecuritySchemes(SESSION_COOKIE, new SecurityScheme()
                        .type(SecurityScheme.Type.APIKEY)
                        .in(SecurityScheme.In.COOKIE)
                        .name("SESSION"))
                .addSecuritySchemes(CSRF_TOKEN, new SecurityScheme()
                        .type(SecurityScheme.Type.APIKEY)
                        .in(SecurityScheme.In.HEADER)
                        .name("X-XSRF-TOKEN")));
    }

    @Bean
    OpenApiCustomizer applicationSecurityContract() {
        return openApi -> {
            openApi.getComponents().getSecuritySchemes().remove("cookieAuth");
            openApi.getPaths().forEach((path, pathItem) ->
                    pathItem.readOperationsMap().forEach((method, operation) ->
                            operation.setSecurity(securityFor(path, method, operation))));
        };
    }

    private static List<SecurityRequirement> securityFor(
            String path,
            io.swagger.v3.oas.models.PathItem.HttpMethod method,
            Operation operation) {
        if (!path.startsWith("/api/")) {
            return operation.getSecurity();
        }

        SecurityRequirement requirement = new SecurityRequirement();
        if (!"/api/auth/login".equals(path)) {
            requirement.addList(SESSION_COOKIE);
        }
        if (method != io.swagger.v3.oas.models.PathItem.HttpMethod.GET
                && method != io.swagger.v3.oas.models.PathItem.HttpMethod.HEAD
                && method != io.swagger.v3.oas.models.PathItem.HttpMethod.OPTIONS) {
            requirement.addList(CSRF_TOKEN);
        }
        return List.of(requirement);
    }
}
