package com.vireocode.starter_template.app.item;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record ItemDTO(
        Long id,
        @NotBlank String name,
        String description,
        @NotNull @PositiveOrZero Integer quantity,
        @NotNull ItemStatus status) {
}

