package com.vireocode.startertemplate.app.item;

import com.vireocode.vireo.base.BaseEntity;
import com.vireocode.vireo.queryengine.Filterable;
import com.vireocode.vireo.queryengine.FilterableMetadata;
import com.vireocode.vireo.queryengine.QueryOperator;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "item")
@FilterableMetadata(title = "item.title")
@Getter
@Setter
@NoArgsConstructor
public class Item extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    @Filterable(label = "item.fields.name", operators = {
            QueryOperator.CONTAINS, QueryOperator.EQUALS, QueryOperator.STARTS_WITH, QueryOperator.ENDS_WITH
    })
    private String name;

    @Column(length = 2000)
    @Filterable(label = "item.fields.description", operators = { QueryOperator.CONTAINS, QueryOperator.EQUALS })
    private String description;

    @NotNull
    @PositiveOrZero
    @Column(nullable = false)
    @Filterable(label = "item.fields.quantity")
    private Integer quantity;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    @Filterable(label = "item.fields.status")
    private ItemStatus status;
}
