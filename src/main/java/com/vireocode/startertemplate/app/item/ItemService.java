package com.vireocode.startertemplate.app.item;

import java.util.List;

import org.springframework.stereotype.Service;

import com.vireocode.vireo.base.BaseService;
import com.vireocode.vireo.base.EntityConfig;
import com.vireocode.startertemplate.app.history.AppHistoryEntityType;

@Service
public class ItemService extends BaseService<Long, Item, ItemDTO> {

    public ItemService(ItemRepository repository, ItemMapper mapper) {
        super(repository, mapper, EntityConfig.builder()
                .localSearchableFields(List.of("name", "description", "status"))
                .softDelete(true)
                .history(AppHistoryEntityType.ITEM)
                .build());
    }
}
