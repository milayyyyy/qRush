package org.qrush.ticketing_system.dto;

public class AuthResponse {
    private Long userID;
    private String name;
    private String email;
    private String role;
    private String contact;

    public AuthResponse() {}

    public AuthResponse(Long userID, String name, String email, String role, String contact) {
        this.userID = userID;
        this.name = name;
        this.email = email;
        this.role = role;
        this.contact = contact;
    }

    // Getters and Setters
    public Long getUserID() { return userID; }
    public void setUserID(Long userID) { this.userID = userID; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getContact() { return contact; }
    public void setContact(String contact) { this.contact = contact; }
}