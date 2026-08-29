package com.vireocode.startertemplate.config;

import java.util.Arrays;
import java.util.Locale;

import org.springframework.boot.EnvironmentPostProcessor;
import org.springframework.boot.SpringApplication;
import org.springframework.core.env.ConfigurableEnvironment;

/** Refuses embedded datasource URLs before a production application context can initialize persistence. */
public final class ProductionDatasourceEnvironmentPostProcessor implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        boolean production = Arrays.stream(environment.getActiveProfiles()).anyMatch("prod"::equals);
        if (!production) {
            return;
        }

        String datasourceUrl = environment.getProperty("spring.datasource.url", "").trim()
                .toLowerCase(Locale.ROOT);
        if (datasourceUrl.startsWith("jdbc:h2:")) {
            throw new IllegalStateException(
                    "The prod profile requires an external datasource; embedded H2 is development/test only");
        }
    }
}
