package com.vireocode.startertemplate.config;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.InputStream;
import java.net.URL;
import java.util.Enumeration;
import java.util.Properties;
import org.junit.jupiter.api.Test;
import org.springframework.boot.EnvironmentPostProcessor;
import org.springframework.boot.SpringApplication;
import org.springframework.mock.env.MockEnvironment;

class ProductionDatasourceEnvironmentPostProcessorTest {

    private final ProductionDatasourceEnvironmentPostProcessor processor =
            new ProductionDatasourceEnvironmentPostProcessor();
    private final SpringApplication application = new SpringApplication();

    @Test
    void productionRejectsEmbeddedH2() {
        MockEnvironment environment = new MockEnvironment()
                .withProperty("spring.profiles.active", "prod")
                .withProperty("spring.datasource.url", "jdbc:h2:file:./accidental-production");
        environment.setActiveProfiles("prod");

        assertThrows(IllegalStateException.class,
                () -> processor.postProcessEnvironment(environment, application));
    }

    @Test
    void productionAcceptsExternalPostgresql() {
        MockEnvironment environment = new MockEnvironment()
                .withProperty("spring.datasource.url", "jdbc:postgresql://db.internal:5432/application");
        environment.setActiveProfiles("prod");

        assertDoesNotThrow(() -> processor.postProcessEnvironment(environment, application));
    }

    @Test
    void developmentMayUseEmbeddedH2() {
        MockEnvironment environment = new MockEnvironment()
                .withProperty("spring.datasource.url", "jdbc:h2:file:./.data/development");
        environment.setActiveProfiles("dev");

        assertDoesNotThrow(() -> processor.postProcessEnvironment(environment, application));
    }

    @Test
    void guardIsRegisteredForApplicationBootstrap() throws Exception {
        ClassLoader classLoader = getClass().getClassLoader();
        Enumeration<URL> resources = classLoader.getResources("META-INF/spring.factories");
        boolean registered = false;

        while (resources.hasMoreElements()) {
            Properties factories = new Properties();
            try (InputStream input = resources.nextElement().openStream()) {
                factories.load(input);
            }
            String processors = factories.getProperty(EnvironmentPostProcessor.class.getName(), "");
            if (processors.contains(ProductionDatasourceEnvironmentPostProcessor.class.getName())) {
                registered = true;
                break;
            }
        }

        assertTrue(registered, "production datasource guard must be registered in spring.factories");
    }
}
