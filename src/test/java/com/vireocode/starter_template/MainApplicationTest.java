package com.vireocode.starter_template;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MainApplicationTest {

    private final MockMvc mockMvc;

    @Autowired
    MainApplicationTest(MockMvc mockMvc) {
        this.mockMvc = mockMvc;
    }

    @Test
    void contextLoads() {
    }

    @Test
    @WithMockUser(roles = "USER")
    @DisplayName("POST /api/items/search binds its public query parameters")
    void searchItems_BindsExplicitRequestParameterNames() throws Exception {
        mockMvc.perform(post("/api/items/search")
                .with(csrf())
                .queryParam("page", "0")
                .queryParam("rowsPerPage", "10")
                .queryParam("sortBy", "name")
                .queryParam("sortDirection", "asc"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "USER")
    @DisplayName("Query Engine publishes Item filter metadata")
    void queryEngine_PublishesItemMetadata() throws Exception {
        mockMvc.perform(get("/api/queryengine/entities/ITEM"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.key").value("ITEM"))
                .andExpect(jsonPath("$.fields[?(@.path == 'name')].label").value("item.fields.name"))
                .andExpect(jsonPath("$.fields[?(@.path == 'status')].type").value("ENUM"));
    }

    @Test
    @WithMockUser(roles = "USER")
    @DisplayName("Item search accepts a metadata-backed structured filter")
    void searchItems_AcceptsStructuredFilters() throws Exception {
        mockMvc.perform(post("/api/items/search")
                .with(csrf())
                .queryParam("page", "0")
                .queryParam("rowsPerPage", "10")
                .queryParam("sortBy", "name")
                .queryParam("sortDirection", "asc")
                .contentType("application/json")
                .content("""
                        {
                          "entity": "ITEM",
                          "rows": [{
                            "kind": "leaf",
                            "path": "status",
                            "operator": "EQUALS",
                            "value": "ACTIVE",
                            "parameterized": false,
                            "selectedOptions": []
                          }]
                        }
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[*].status").value(org.hamcrest.Matchers.everyItem(
                        org.hamcrest.Matchers.is("ACTIVE"))));
    }
}
