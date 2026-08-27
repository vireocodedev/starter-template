package com.vireocode.startertemplate.app.query;

import java.util.Map;

import org.springframework.stereotype.Component;

import com.vireocode.vireo.queryengine.QueryEntityKey;
import com.vireocode.vireo.queryengine.QueryEntityTypeResolver;
import com.vireocode.vireo.queryengine.savedfilter.SavedFilter;
import com.vireocode.startertemplate.app.item.Item;

@Component
public class AppQueryEntityTypeResolver implements QueryEntityTypeResolver {

    @Override
    public Map<QueryEntityKey, Class<?>> entityTypes() {
        return Map.of(
                AppQueryEntityKey.ITEM, Item.class,
                AppQueryEntityKey.SAVED_FILTER, SavedFilter.class);
    }
}
