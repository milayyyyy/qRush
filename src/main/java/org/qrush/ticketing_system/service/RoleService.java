package org.qrush.ticketing_system.service;

import org.qrush.ticketing_system.entity.RoleEntity;
import org.qrush.ticketing_system.repository.RoleRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RoleService {

    private final RoleRepository roleRepository;

    public RoleService(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    public List<RoleEntity> getAllRoles() {
        return roleRepository.findAll();
    }

    public Optional<RoleEntity> getRoleById(Long id) {
        return roleRepository.findById(id);
    }

    public RoleEntity createRole(RoleEntity role) {
        return roleRepository.save(role);
    }

    public RoleEntity updateRole(Long id, RoleEntity updatedRole) {
        return roleRepository.findById(id).map(role -> {
            role.setRoleName(updatedRole.getRoleName());
            return roleRepository.save(role);
        }).orElse(null);
    }

    public void deleteRole(Long id) {
        roleRepository.deleteById(id);
    }
}
