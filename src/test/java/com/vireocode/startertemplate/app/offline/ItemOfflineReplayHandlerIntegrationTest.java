package com.vireocode.startertemplate.app.offline;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.vireocode.startertemplate.app.item.Item;
import com.vireocode.startertemplate.app.item.ItemRepository;
import com.vireocode.startertemplate.app.item.ItemStatus;
import com.vireocode.vireo.auth.StarterUser;
import com.vireocode.vireo.auth.StarterUserRepository;
import com.vireocode.vireo.offline.OfflineSyncCommandDto;
import com.vireocode.vireo.offline.OfflineSyncCommandResultDto;
import com.vireocode.vireo.offline.OfflineSyncResultReason;

import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ItemOfflineReplayHandlerIntegrationTest {

    private final ItemOfflineReplayHandler handler;
    private final ItemRepository items;
    private final StarterUserRepository users;
    private final ObjectMapper objectMapper;

    @Autowired
    ItemOfflineReplayHandlerIntegrationTest(ItemOfflineReplayHandler handler, ItemRepository items,
            StarterUserRepository users, ObjectMapper objectMapper) {
        this.handler = handler;
        this.items = items;
        this.users = users;
        this.objectMapper = objectMapper;
    }

    @BeforeEach
    void createCurrentUser() {
        if (!users.existsByUsername("user")) {
            StarterUser user = new StarterUser();
            user.setUsername("user");
            user.setPasswordHash("test-hash");
            user.setRole("SUPERADMIN");
            user.setEnabled(true);
            users.save(user);
        }
        if (!users.existsByUsername("reader")) {
            StarterUser reader = new StarterUser();
            reader.setUsername("reader");
            reader.setPasswordHash("test-hash");
            reader.setRole("USER");
            reader.setEnabled(true);
            users.save(reader);
        }
    }

    @Test
    @WithMockUser(roles = "SUPERADMIN")
    @DisplayName("replay creates an Item once and recognizes an uncertain duplicate as already applied")
    void createIsIdempotentAtTheRequestedItemState() throws Exception {
        UUID itemId = UUID.randomUUID();
        OfflineSyncCommandDto command = command("POST", "/api/items", """
                {
                  "id": "%s",
                  "name": "Offline create",
                  "description": "Durable command proof",
                  "quantity": 2,
                  "status": "DRAFT"
                }
                """.formatted(itemId));

        OfflineSyncCommandResultDto applied = handler.process(command);
        OfflineSyncCommandResultDto repeated = handler.process(command);

        assertThat(applied.success()).isTrue();
        assertThat(applied.reason()).isEqualTo(OfflineSyncResultReason.APPLIED);
        assertThat(repeated.success()).isTrue();
        assertThat(repeated.reason()).isEqualTo(OfflineSyncResultReason.ALREADY_APPLIED);
        assertThat(items.findById(itemId)).isPresent();
    }

    @Test
    @WithMockUser(roles = "SUPERADMIN")
    @DisplayName("replay permanently rejects a stale Item version")
    void staleVersionIsAPermanentConflict() throws Exception {
        UUID itemId = UUID.randomUUID();
        Item item = new Item();
        item.setId(itemId);
        item.setName("Current Item");
        item.setQuantity(1);
        item.setStatus(ItemStatus.ACTIVE);
        items.saveAndFlush(item);

        OfflineSyncCommandResultDto result = handler.process(command("PUT", "/api/items/" + itemId, """
                {
                  "id": "%s",
                  "name": "Stale Item",
                  "description": null,
                  "quantity": 3,
                  "status": "ACTIVE",
                  "version": 99
                }
                """.formatted(itemId)));

        assertThat(result.success()).isFalse();
        assertThat(result.status()).isEqualTo(409);
        assertThat(result.reason()).isEqualTo(OfflineSyncResultReason.REJECTED);
        assertThat(items.findById(itemId).orElseThrow().getName()).isEqualTo("Current Item");
    }

    @Test
    @WithMockUser(roles = "SUPERADMIN")
    @DisplayName("replay recognizes an already-soft-deleted Item as an idempotent delete")
    void deleteOfAnAlreadyDeletedItemIsAlreadyApplied() throws Exception {
        UUID itemId = UUID.randomUUID();
        Item item = new Item();
        item.setId(itemId);
        item.setName("Deleted Item");
        item.setQuantity(1);
        item.setStatus(ItemStatus.ACTIVE);
        item.setDeleted(true);
        items.saveAndFlush(item);

        OfflineSyncCommandResultDto result = handler.process(command("DELETE", "/api/items/" + itemId,
                "{ \"version\": 0 }"));

        assertThat(result.success()).isTrue();
        assertThat(result.reason()).isEqualTo(OfflineSyncResultReason.ALREADY_APPLIED);
    }

    @Test
    @WithMockUser(roles = "SUPERADMIN")
    @DisplayName("replay restores a tombstone when local intent wins after rebase")
    void createRestoresATombstone() throws Exception {
        UUID itemId = UUID.randomUUID();
        Item tombstone = new Item();
        tombstone.setId(itemId);
        tombstone.setName("Server-deleted Item");
        tombstone.setQuantity(1);
        tombstone.setStatus(ItemStatus.ARCHIVED);
        tombstone.setDeleted(true);
        items.saveAndFlush(tombstone);

        OfflineSyncCommandResultDto result = handler.process(command("POST", "/api/items", """
                {
                  "id": "%s",
                  "name": "Local item wins",
                  "description": "Restored during replay",
                  "quantity": 7,
                  "status": "ACTIVE",
                  "version": 0
                }
                """.formatted(itemId)));

        Item restored = items.findById(itemId).orElseThrow();
        assertThat(result.success()).isTrue();
        assertThat(result.status()).isEqualTo(200);
        assertThat(restored.isDeleted()).isFalse();
        assertThat(restored.getName()).isEqualTo("Local item wins");
        assertThat(restored.getQuantity()).isEqualTo(7);
    }

    @Test
    @WithMockUser(username = "reader", roles = "USER")
    @DisplayName("USER cannot classify an idempotent replay command")
    void userCannotClassifyAnAlreadyDeletedCommand() throws Exception {
        UUID itemId = UUID.randomUUID();
        Item tombstone = new Item();
        tombstone.setId(itemId);
        tombstone.setName("Deleted Item");
        tombstone.setQuantity(1);
        tombstone.setStatus(ItemStatus.ACTIVE);
        tombstone.setDeleted(true);
        items.saveAndFlush(tombstone);

        OfflineSyncCommandResultDto result = handler.process(command("DELETE", "/api/items/" + itemId,
                "{ \"version\": 0 }"));

        assertThat(result.success()).isFalse();
        assertThat(result.status()).isEqualTo(403);
        assertThat(result.reason()).isEqualTo(OfflineSyncResultReason.REJECTED);
    }

    private OfflineSyncCommandDto command(String method, String url, String body) throws Exception {
        return new OfflineSyncCommandDto(UUID.randomUUID(), method, url, objectMapper.readTree(body), Map.of());
    }
}
