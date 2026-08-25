package com.vireocode.startertemplate.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.session.FlushMode;
import org.springframework.session.jdbc.config.annotation.web.http.EnableJdbcHttpSession;

@Configuration
@Profile("!test")
@EnableJdbcHttpSession(flushMode = FlushMode.IMMEDIATE)
public class SessionConfig {
}
