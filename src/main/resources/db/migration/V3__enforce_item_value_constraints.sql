ALTER TABLE item
    ADD CONSTRAINT ck_item_name_not_blank CHECK (CHAR_LENGTH(TRIM(name)) > 0);

ALTER TABLE item
    ADD CONSTRAINT ck_item_quantity_nonnegative CHECK (quantity >= 0);
