package org.qrush.ticketing_system.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "events")
public class EventEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long eventID;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private String category; // e.g., concert, seminar, festival

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    @Column(name = "ticket_price", nullable = false)
    private Double ticketPrice;

    @Column(nullable = false)
    private Integer capacity;

    @Column(nullable = false)
    private String organizer; // could reference a user in future

    @Column(name = "organizer_display_name")
    private String organizerDisplayName;

    @Column(name = "organizer_email")
    private String organizerEmail;

    @Column(name = "organizer_phone")
    private String organizerPhone;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Lob
    @Column(name = "image_data", columnDefinition = "LONGTEXT")
    private String image;

    @Column(name = "features", columnDefinition = "LONGTEXT")
    private String features;

    @Column(name = "agenda", columnDefinition = "LONGTEXT")
    private String agenda;

    @Column(name = "ticket_types", columnDefinition = "LONGTEXT")
    private String ticketTypes; // JSON array of ticket types with name and price

    @Column(name = "view_count", nullable = false)
    private Long views = 0L;

    @Column(name = "tickets_sold", nullable = false)
    private Integer ticketsSold = 0;

    // ...existing code...

    @Column(name = "cancellation_reason", columnDefinition = "TEXT")
    private String cancellationReason;

    @Column(name = "cancelled_at")
    private java.time.LocalDateTime cancelledAt;

    // Getters and Setters
    public Long getEventID() {
        return eventID;
    }

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private EventStatus status = EventStatus.AVAILABLE;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    public Double getTicketPrice() {
        return ticketPrice;
    }

    public void setTicketPrice(Double ticketPrice) {
        this.ticketPrice = ticketPrice;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getOrganizer() {
        return organizer;
    }

    public void setOrganizer(String organizer) {
        this.organizer = organizer;
    }

    public String getOrganizerDisplayName() {
        return organizerDisplayName;
    }

    public void setOrganizerDisplayName(String organizerDisplayName) {
        this.organizerDisplayName = organizerDisplayName;
    }

    public String getOrganizerEmail() {
        return organizerEmail;
    }

    public void setOrganizerEmail(String organizerEmail) {
        this.organizerEmail = organizerEmail;
    }

    public String getOrganizerPhone() {
        return organizerPhone;
    }

    public void setOrganizerPhone(String organizerPhone) {
        this.organizerPhone = organizerPhone;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public String getFeatures() {
        return features;
    }

    public void setFeatures(String features) {
        this.features = features;
    }

    public String getAgenda() {
        return agenda;
    }

    public void setAgenda(String agenda) {
        this.agenda = agenda;
    }

    public String getTicketTypes() {
        return ticketTypes;
    }

    public void setTicketTypes(String ticketTypes) {
        this.ticketTypes = ticketTypes;
    }

    public Long getViews() {
        return views;
    }

    public void setViews(Long views) {
        this.views = views;
    }

    public Integer getTicketsSold() {
        return ticketsSold;
    }

    public void setTicketsSold(Integer ticketsSold) {
        this.ticketsSold = ticketsSold;
    }

    // ...existing code...

    public String getCancellationReason() {
        return cancellationReason;
    }

    public void setCancellationReason(String cancellationReason) {
        this.cancellationReason = cancellationReason;
    }

    public java.time.LocalDateTime getCancelledAt() {
        return cancelledAt;
    }

    public void setCancelledAt(java.time.LocalDateTime cancelledAt) {
        this.cancelledAt = cancelledAt;
    }

    public EventStatus getStatus() {
        return status;
    }

    public void setStatus(EventStatus status) {
        this.status = status;
    }
}
