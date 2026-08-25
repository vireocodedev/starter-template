package com.vireocode.startertemplate.app.item;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ItemApiIntegrationTest {

    private final MockMvc mockMvc;
    private final ItemRepository items;

    @Autowired
    ItemApiIntegrationTest(MockMvc mockMvc, ItemRepository items) {
        this.mockMvc = mockMvc;
        this.items = items;
    }

    @Test
    @WithMockUser(roles = "SUPERADMIN")
    @DisplayName("Item API supports its complete create, search, update, and delete lifecycle")
    void itemLifecycle() throws Exception {
        mockMvc.perform(post("/api/items")
                .with(csrf())
                .contentType("application/json")
                .content("""
                        {
                          "name": "Lifecycle proof",
                          "description": "Created by the API integration contract.",
                          "quantity": 3,
                          "status": "DRAFT"
                        }
                        """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.name").value("Lifecycle proof"));

        Item created = items.findAll().stream()
                .filter(item -> "Lifecycle proof".equals(item.getName()))
                .findFirst()
                .orElseThrow();

        mockMvc.perform(post("/api/items/search")
                .with(csrf())
                .queryParam("searchText", "Lifecycle proof")
                .contentType("application/json"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(created.getId()))
                .andExpect(jsonPath("$.content[0].status").value("DRAFT"));

        mockMvc.perform(put("/api/items/{id}", created.getId())
                .with(csrf())
                .contentType("application/json")
                .content("""
                        {
                          "name": "Lifecycle proof updated",
                          "description": null,
                          "quantity": 8,
                          "status": "ACTIVE"
                        }
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(created.getId()))
                .andExpect(jsonPath("$.name").value("Lifecycle proof updated"))
                .andExpect(jsonPath("$.status").value("ACTIVE"));

        mockMvc.perform(delete("/api/items/{id}", created.getId()).with(csrf()))
                .andExpect(status().isNoContent());

        mockMvc.perform(post("/api/items/search")
                .with(csrf())
                .queryParam("searchText", "Lifecycle proof updated")
                .contentType("application/json"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isEmpty());
    }

    @Test
    @WithMockUser(roles = "SUPERADMIN")
    @DisplayName("Item API rejects structurally invalid writes")
    void createRejectsInvalidPayload() throws Exception {
        mockMvc.perform(post("/api/items")
                .with(csrf())
                .contentType("application/json")
                .content("""
                        {
                          "name": "",
                          "quantity": -1,
                          "status": null
                        }
                        """))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Item API rejects unauthenticated access")
    void searchRejectsUnauthenticatedAccess() throws Exception {
        mockMvc.perform(post("/api/items/search").with(csrf()))
                .andExpect(status().isUnauthorized());
    }
}
