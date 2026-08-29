package com.vireocode.startertemplate.app.item;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record ItemDTO(
        Long id,
        @NotBlank @Size(max = 255) String name,
        @Size(max = 2000) String description,
        @NotNull @PositiveOrZero Integer quantity,
        @NotNull ItemStatus status) {
}
