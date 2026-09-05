package com.vireocode.startertemplate.app.item;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import com.vireocode.vireo.base.BaseMapper;
import com.vireocode.vireo.base.JsonNullableMapper;

@Mapper(uses = JsonNullableMapper.class, unmappedTargetPolicy = ReportingPolicy.IGNORE, componentModel = "spring")
public interface ItemMapper extends BaseMapper<Item, ItemDTO> {

    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "version", ignore = true)
    Item toDomain(ItemDTO dto);

    @Override
    ItemDTO toDto(Item domain);

    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "version", ignore = true)
    void update(ItemDTO update, @MappingTarget Item destination);
}
