package com.vireocode.starter_template.app.query;

import java.util.Map;

import org.springframework.stereotype.Component;

import com.vireocode.starter.queryengine.QueryEntityKey;
import com.vireocode.starter.queryengine.QueryEntityTypeResolver;
import com.vireocode.starter.queryengine.savedfilter.SavedFilter;
import com.vireocode.starter_template.app.item.Item;

@Component
public class AppQueryEntityTypeResolver implements QueryEntityTypeResolver {

    @Override
    public Map<QueryEntityKey, Class<?>> entityTypes() {
        return Map.of(
                AppQueryEntityKey.ITEM, Item.class,
                AppQueryEntityKey.SAVED_FILTER, SavedFilter.class);
    }
}

