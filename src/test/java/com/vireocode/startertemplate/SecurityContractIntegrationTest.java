package com.vireocode.startertemplate;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import com.vireocode.vireo.auth.StarterUser;
import com.vireocode.vireo.auth.StarterUserRepository;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class SecurityContractIntegrationTest {

    private final MockMvc mockMvc;
    private final StarterUserRepository users;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    SecurityContractIntegrationTest(MockMvc mockMvc, StarterUserRepository users, PasswordEncoder passwordEncoder) {
        this.mockMvc = mockMvc;
        this.users = users;
        this.passwordEncoder = passwordEncoder;
    }

    @BeforeEach
    void createUser() {
        StarterUser user = new StarterUser();
        user.setUsername("security-contract-user");
        user.setPasswordHash(passwordEncoder.encode("test-only-password"));
        user.setRole("USER");
        user.setEnabled(true);
        users.save(user);
    }

    @Test
    @DisplayName("Unauthenticated API failures are generic, protected, and do not leak stack details")
    void unauthenticatedBoundaryIsHardened() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(header().string("X-Frame-Options", "DENY"))
                .andExpect(header().string(HttpHeaders.CACHE_CONTROL, containsString("no-cache")))
                .andExpect(content().string(containsString("Unauthorized")))
                .andExpect(content().string(not(containsString("Exception"))))
                .andExpect(content().string(not(containsString("startertemplate"))));
    }

    @Test
    @DisplayName("State-changing authenticated API calls require a CSRF token")
    void mutationWithoutCsrfIsRejected() throws Exception {
        MockHttpSession session = login();

        mockMvc.perform(post("/api/items/search").session(session).contentType("application/json"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("JSON login changes a pre-existing session identifier")
    void loginPreventsSessionFixation() throws Exception {
        MockHttpSession session = new MockHttpSession();
        String identifierBeforeLogin = session.getId();

        mockMvc.perform(post("/api/auth/login")
                .session(session)
                .contentType("application/json")
                .content(credentials()))
                .andExpect(status().isOk());

        assertNotEquals(identifierBeforeLogin, session.getId());
    }

    @Test
    @DisplayName("Invalid credentials never echo the supplied password")
    void invalidCredentialsAreRedacted() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                .contentType("application/json")
                .content(credentials().replace("test-only-password", "should-never-appear")))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string(not(containsString("should-never-appear"))));
    }

    private MockHttpSession login() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType("application/json")
                .content(credentials()))
                .andExpect(status().isOk())
                .andReturn();
        return (MockHttpSession) result.getRequest().getSession(false);
    }

    private static String credentials() {
        return """
                {
                  "username": "security-contract-user",
                  "password": "test-only-password"
                }
                """;
    }
}
