package org.qrush.ticketing_system.controller;

import org.qrush.ticketing_system.dto.CancelEventRequest;
import org.qrush.ticketing_system.dto.CancelEventResponse;
import org.qrush.ticketing_system.entity.EventEntity;
import org.qrush.ticketing_system.service.EventService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping
    public List<EventEntity> getAllEvents() {
        return eventService.getAllEvents();
    }

    @GetMapping("/{id}")
    public EventEntity getEventById(@PathVariable Long id) {
        // Just return the event without tracking views
        return eventService.getEventById(id)
                .orElseThrow(() -> new RuntimeException("Event not found with ID: " + id));
    }

    @PostMapping("/{id}/track-view")
    public void trackEventView(@PathVariable Long id,
            @RequestParam(name = "userId", required = false) Long userId,
            @RequestParam(name = "userRole", required = false) String userRole) {
        // Don't count views for staff and organizers
        boolean isStaffOrOrganizer = userRole != null &&
                (userRole.equalsIgnoreCase("staff") || userRole.equalsIgnoreCase("organizer"));

        if (!isStaffOrOrganizer) {
            if (userId != null) {
                eventService.trackUniqueView(id, userId, userRole);
            } else {
                eventService.incrementViews(id);
            }
        }
    }

    @PostMapping
    public EventEntity createEvent(@RequestBody EventEntity event) {
        return eventService.createEvent(event);
    }

    @PutMapping("/{id}")
    public EventEntity updateEvent(@PathVariable Long id, @RequestBody EventEntity updatedEvent) {
        return eventService.updateEvent(id, updatedEvent);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEvent(@PathVariable Long id) {
        try {
            eventService.deleteEvent(id);
            return ResponseEntity.ok(Map.of("success", true, "message", "Event deleted successfully"));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage(),
                    "hasTickets", true));
        }
    }

    @GetMapping("/{id}/can-delete")
    public ResponseEntity<Map<String, Object>> canDeleteEvent(@PathVariable Long id) {
        boolean canDelete = eventService.canDeleteEvent(id);
        return ResponseEntity.ok(Map.of(
                "canDelete", canDelete,
                "message", canDelete ? "Event can be deleted" : "Event has tickets sold and cannot be deleted"));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<CancelEventResponse> cancelEvent(
            @PathVariable Long id,
            @RequestBody(required = false) CancelEventRequest request) {
        try {
            String reason = request != null ? request.getReason() : null;
            CancelEventResponse response = eventService.cancelEvent(id, reason);
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(new CancelEventResponse(
                    false, e.getMessage(), 0, 0));
        }
    }
}
