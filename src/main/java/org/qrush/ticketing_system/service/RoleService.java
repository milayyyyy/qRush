package org.qrush.ticketing_system.service;

import org.qrush.ticketing_system.entity.RoleEntity;
import org.qrush.ticketing_system.repository.RoleRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class RoleService {

    private final RoleRepository roleRepository;
    private static final String ROLE_ID_REQUIRED = "Role ID must not be null";

    public RoleService(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    public List<RoleEntity> getAllRoles() {
        return roleRepository.findAll();
    }

    public Optional<RoleEntity> getRoleById(Long id) {
        return roleRepository.findById(Objects.requireNonNull(id, ROLE_ID_REQUIRED));
    }

    public Optional<RoleEntity> getRoleByName(String roleName) {
        return roleRepository.findByRoleNameIgnoreCase(
                Objects.requireNonNull(roleName, "Role name must not be null"));
    }

    public RoleEntity createRole(RoleEntity role) {
        return roleRepository.save(Objects.requireNonNull(role, "Role must not be null"));
    }

    public RoleEntity updateRole(Long id, RoleEntity updatedRole) {
        Objects.requireNonNull(id, ROLE_ID_REQUIRED);
        Objects.requireNonNull(updatedRole, "Updated role must not be null");
        return roleRepository.findById(id).map(role -> {
            role.setRoleName(updatedRole.getRoleName());
            return roleRepository.save(role);
        }).orElse(null);
    }

    public void deleteRole(Long id) {
        roleRepository.deleteById(Objects.requireNonNull(id, ROLE_ID_REQUIRED));
    }

    /**
     * Initialize default roles if they don't exist
     */
    public void initializeDefaultRoles() {
        String[] defaultRoles = { "attendee", "organizer", "staff" };
        for (String roleName : defaultRoles) {
            if (roleRepository.findByRoleNameIgnoreCase(roleName).isEmpty()) {
                RoleEntity role = new RoleEntity();
                role.setRoleName(roleName);
                roleRepository.save(role);
            }
        }
    }
}
