package com.vireocode.starter_template.app.auth;

public final class AppSecurityExpressions {

    public static final String CAN_READ_ITEMS = "hasAnyRole('USER', 'SUPERADMIN')";
    public static final String CAN_MANAGE_ITEMS = "hasRole('SUPERADMIN')";

    private AppSecurityExpressions() {
    }
}

