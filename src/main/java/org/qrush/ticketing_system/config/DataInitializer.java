package org.qrush.ticketing_system.config;

import org.qrush.ticketing_system.service.RoleService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final RoleService roleService;

    public DataInitializer(RoleService roleService) {
        this.roleService = roleService;
    }

    @Override
    public void run(String... args) {
        // Initialize default roles on application startup
        roleService.initializeDefaultRoles();
        System.out.println("Default roles initialized: attendee, organizer, staff");
    }
}
