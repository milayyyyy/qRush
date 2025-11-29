package org.qrush.ticketing_system.service;

import org.qrush.ticketing_system.dto.SignupRequest;
import org.qrush.ticketing_system.dto.AuthResponse;
import org.qrush.ticketing_system.dto.LoginRequest;
import org.qrush.ticketing_system.entity.UserEntity;
import org.qrush.ticketing_system.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    public AuthResponse registerUser(SignupRequest signupRequest) {
        // Check if email already exists
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        // Create user entity
        UserEntity user = new UserEntity();
        user.setName(signupRequest.getName());
        user.setEmail(signupRequest.getEmail());
        user.setPassword(signupRequest.getPassword()); // We'll encrypt later
        user.setRole(signupRequest.getRole().toUpperCase());
        user.setContact(signupRequest.getContact());

        UserEntity savedUser = userRepository.save(user);

        return new AuthResponse("Signup successful");

    }

    public AuthResponse loginUser(LoginRequest loginRequest) {
        // Find user by email
        UserEntity user = userRepository.findByEmail(loginRequest.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Check password (plain text for now - we'll encrypt later)
        if (!user.getPassword().equals(loginRequest.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        return new AuthResponse(
            user.getUserID(),
            user.getName(),
            user.getEmail(),
            user.getRole(),
            user.getContact()
        );
    }
}