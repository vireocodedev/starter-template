package com.vireocode.starter_template.app.item;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.vireocode.starter.queryengine.QueryFilterRequest;
import com.vireocode.starter.web.RestUtils;
import com.vireocode.starter.web.SearchablePageable;
import com.vireocode.starter_template.app.auth.AppSecurityExpressions;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/items")
public class ItemController {

    private final ItemService service;

    public ItemController(ItemService service) {
        this.service = service;
    }

    @PostMapping("/search")
    @PreAuthorize(AppSecurityExpressions.CAN_READ_ITEMS)
    public Page<ItemDTO> search(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "rowsPerPage", defaultValue = "10") int rowsPerPage,
            @RequestParam(name = "sortBy", defaultValue = "name") String sortBy,
            @RequestParam(name = "sortDirection", defaultValue = "asc") String sortDirection,
            @RequestParam(name = "searchText", required = false) String searchText,
            @RequestBody(required = false) QueryFilterRequest filters) {
        SearchablePageable pageable = RestUtils.makePageable(page, rowsPerPage, sortBy, sortDirection, searchText);
        return service.findAll(pageable, filters);
    }

    @PostMapping
    @PreAuthorize(AppSecurityExpressions.CAN_MANAGE_ITEMS)
    @ResponseStatus(HttpStatus.CREATED)
    public ItemDTO create(@Valid @RequestBody ItemDTO item) {
        return service.create(item);
    }

    @PutMapping("/{id}")
    @PreAuthorize(AppSecurityExpressions.CAN_MANAGE_ITEMS)
    public ItemDTO update(@PathVariable("id") Long id, @Valid @RequestBody ItemDTO item) {
        return service.update(id, item);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(AppSecurityExpressions.CAN_MANAGE_ITEMS)
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable("id") Long id) {
        service.delete(id);
    }
}
