package com.vireocode.startertemplate.app.item;

import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vireocode.vireo.base.BaseService;
import com.vireocode.vireo.base.EntityConfig;
import com.vireocode.vireo.web.RestUtils;
import com.vireocode.startertemplate.app.auth.AppCurrentUser;
import com.vireocode.startertemplate.app.history.AppHistoryEntityType;

@Service
public class ItemService extends BaseService<UUID, Item, ItemDTO> {

    private final ItemRepository itemRepository;
    private final AppCurrentUser currentUser;

    public ItemService(ItemRepository repository, ItemMapper mapper, AppCurrentUser currentUser) {
        super(repository, mapper, EntityConfig.builder()
                .localSearchableFields(List.of("name", "description", "status"))
                .softDelete(true)
                .history(AppHistoryEntityType.ITEM)
                .build());
        this.itemRepository = repository;
        this.currentUser = currentUser;
    }

    /**
     * Uses the same service boundary as REST and replay. A stale write is a
     * permanent conflict rather than an implicit last-write-wins update.
     */
    @Override
    protected void validateCreateRequest(ItemDTO dto) {
        currentUser.requireCanManageItems();
        if (dto.id() == null) {
            throw RestUtils.badRequest("Item id is required.");
        }
        if (dto.version() != null && dto.version() != 0L) {
            throw RestUtils.badRequest("A new Item version must be omitted or zero.");
        }
        if (itemRepository.existsById(dto.id())) {
            throw RestUtils.conflict("An Item with this id already exists.");
        }
    }

    @Override
    protected Item buildCreateDomain(ItemDTO dto) {
        Item domain = super.buildCreateDomain(dto);
        domain.setId(dto.id());
        return domain;
    }

    @Override
    protected void validateUpdateRequest(UUID id, ItemDTO dto) {
        currentUser.requireCanManageItems();
        requireMatchingId(id, dto);
        requireVersion(dto.version());
        requireCurrentVersion(id, dto.version());
    }

    @Override
    protected void validateDeleteRequest(UUID id) {
        currentUser.requireCanManageItems();
    }

    /**
     * BaseService owns soft-delete history and SSE behavior. This overload adds
     * the API/replay version precondition before delegating to that shared path.
     */
    public void deleteWithVersion(UUID id, long version) {
        currentUser.requireCanManageItems();
        if (version < 0) {
            throw RestUtils.badRequest("Item version must not be negative.");
        }
        requireCurrentVersion(id, version);
        super.delete(id);
    }

    /**
     * Restores a soft-deleted Item during a replayed local-wins command. The
     * public REST collection endpoint still rejects an existing id; restoration
     * is deliberately limited to the authenticated replay path.
     */
    @Transactional
    public ItemDTO restore(ItemDTO dto) {
        currentUser.requireCanManageItems();
        if (dto.id() == null) {
            throw RestUtils.badRequest("Item id is required.");
        }
        Item tombstone = itemRepository.findById(dto.id())
                .filter(Item::isDeleted)
                .orElseThrow(() -> RestUtils.conflict("An active Item with this id already exists."));

        ItemDTO previousDto = snapshotForHistory(tombstone);
        applyUpdateChanges(tombstone, dto);
        tombstone.setDeleted(false);
        Item restored = itemRepository.saveAndFlush(tombstone);
        return finalizeUpdatedEntity(restored, previousDto);
    }

    /** Read including a soft-deleted row for idempotent replay classification. */
    public Optional<Item> findIncludingDeleted(UUID id) {
        return itemRepository.findById(id);
    }

    /** Requested persisted state is enough to classify an uncertain replay as applied. */
    public boolean matches(Item current, ItemDTO requested) {
        return current != null
                && !current.isDeleted()
                && Objects.equals(current.getId(), requested.id())
                && Objects.equals(current.getName(), requested.name())
                && Objects.equals(current.getDescription(), requested.description())
                && Objects.equals(current.getQuantity(), requested.quantity())
                && current.getStatus() == requested.status();
    }

    private void requireMatchingId(UUID id, ItemDTO dto) {
        if (dto.id() == null || !id.equals(dto.id())) {
            throw RestUtils.badRequest("Item id must match the request path.");
        }
    }

    private void requireVersion(Long version) {
        if (version == null || version < 0) {
            throw RestUtils.badRequest("Item version is required and must not be negative.");
        }
    }

    private void requireCurrentVersion(UUID id, long requestedVersion) {
        Item current = itemRepository.findById(id)
                .filter(item -> !item.isDeleted())
                .orElseThrow(() -> RestUtils.notFound("id", String.valueOf(id)));
        if (!Objects.equals(current.getVersion(), requestedVersion)) {
            throw RestUtils.conflict("The Item has changed on the server.");
        }
    }
}
