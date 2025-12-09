package org.qrush.ticketing_system.service;

import org.qrush.ticketing_system.dto.CancelEventResponse;
import org.qrush.ticketing_system.entity.EventEntity;
import org.qrush.ticketing_system.entity.EventViewEntity;
import org.qrush.ticketing_system.entity.TicketEntity;
import org.qrush.ticketing_system.repository.AttendanceLogRepository;
import org.qrush.ticketing_system.repository.EventRepository;
import org.qrush.ticketing_system.repository.EventViewRepository;
import org.qrush.ticketing_system.repository.PaymentRepository;
import org.qrush.ticketing_system.repository.TicketRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final EventViewRepository eventViewRepository;
    private final TicketRepository ticketRepository;
    private final PaymentRepository paymentRepository;
    private final AttendanceLogRepository attendanceLogRepository;
    private final NotificationService notificationService;
    private static final String EVENT_ID_MUST_NOT_BE_NULL = "Event ID must not be null";

    public EventService(EventRepository eventRepository, EventViewRepository eventViewRepository,
            TicketRepository ticketRepository, PaymentRepository paymentRepository,
            AttendanceLogRepository attendanceLogRepository, NotificationService notificationService) {
        this.eventRepository = eventRepository;
        this.eventViewRepository = eventViewRepository;
        this.ticketRepository = ticketRepository;
        this.paymentRepository = paymentRepository;
        this.attendanceLogRepository = attendanceLogRepository;
        this.notificationService = notificationService;
    }

    public List<EventEntity> getAllEvents() {
        return eventRepository.findAll();
    }

    public Optional<EventEntity> getEventById(Long id) {
        return eventRepository.findById(Objects.requireNonNull(id, EVENT_ID_MUST_NOT_BE_NULL));
    }

    public EventEntity createEvent(EventEntity event) {
        EventEntity toCreate = Objects.requireNonNull(event, "Event must not be null");
        if (toCreate.getViews() == null) {
            toCreate.setViews(0L);
        }
        EventEntity savedEvent = eventRepository.save(toCreate);

        // Send notification to organizer
        if (savedEvent.getOrganizer() != null && !savedEvent.getOrganizer().isEmpty()) {
            try {
                Long organizerId = Long.parseLong(savedEvent.getOrganizer());
                notificationService.createEventNotification(
                        organizerId,
                        "success",
                        "Event Created",
                        String.format("Your event \"%s\" has been successfully created and is now live!",
                                savedEvent.getName()),
                        savedEvent.getEventID());
            } catch (NumberFormatException e) {
                // Organizer is not a valid user ID, skip notification
            }
        }

        return savedEvent;
    }

    public EventEntity updateEvent(Long id, EventEntity updatedEvent) {
        Objects.requireNonNull(id, EVENT_ID_MUST_NOT_BE_NULL);
        Objects.requireNonNull(updatedEvent, "Updated event must not be null");
        return eventRepository.findById(id).map(event -> {
            event.setName(updatedEvent.getName());
            event.setLocation(updatedEvent.getLocation());
            event.setCategory(updatedEvent.getCategory());
            event.setStartDate(updatedEvent.getStartDate());
            event.setEndDate(updatedEvent.getEndDate());
            event.setTicketPrice(updatedEvent.getTicketPrice());
            event.setCapacity(updatedEvent.getCapacity());
            event.setOrganizer(updatedEvent.getOrganizer());
            event.setOrganizerDisplayName(updatedEvent.getOrganizerDisplayName());
            event.setOrganizerEmail(updatedEvent.getOrganizerEmail());
            event.setOrganizerPhone(updatedEvent.getOrganizerPhone());
            event.setDescription(updatedEvent.getDescription());
            if (updatedEvent.getImage() != null) {
                event.setImage(updatedEvent.getImage());
            }
            if (updatedEvent.getFeatures() != null) {
                event.setFeatures(updatedEvent.getFeatures());
            }
            if (updatedEvent.getAgenda() != null) {
                event.setAgenda(updatedEvent.getAgenda());
            }
            if (updatedEvent.getViews() != null) {
                event.setViews(updatedEvent.getViews());
            }
            return eventRepository.save(event);
        }).orElseThrow(() -> new RuntimeException("Event not found with ID: " + id));
    }

    public EventEntity getEventByIdAndIncrementViews(Long id) {
        Objects.requireNonNull(id, EVENT_ID_MUST_NOT_BE_NULL);
        return eventRepository.findById(id)
                .map(event -> {
                    long current = Optional.ofNullable(event.getViews()).orElse(0L);
                    event.setViews(current + 1);
                    return eventRepository.save(event);
                })
                .orElseThrow(() -> new RuntimeException("Event not found with ID: " + id));
    }

    /**
     * Increment view count for an event (for anonymous users)
     */
    public void incrementViews(Long eventId) {
        Objects.requireNonNull(eventId, EVENT_ID_MUST_NOT_BE_NULL);
        eventRepository.findById(eventId).ifPresent(event -> {
            long current = Optional.ofNullable(event.getViews()).orElse(0L);
            event.setViews(current + 1);
            eventRepository.save(event);
        });
    }

    /**
     * Track unique view for attendees only.
     * Staff and organizers don't count towards view count.
     * Each attendee's view is counted only once per event.
     */
    public void trackUniqueView(Long eventId, Long userId, String userRole) {
        Objects.requireNonNull(eventId, EVENT_ID_MUST_NOT_BE_NULL);

        // Only count views for attendees (not staff or organizers)
        if (userId == null || userRole == null || !userRole.equalsIgnoreCase("attendee")) {
            return;
        }

        // Check if this user has already viewed this event
        boolean hasViewed = eventViewRepository.existsByEventIdAndUserId(eventId, userId);

        if (!hasViewed) {
            // Record the unique view
            EventViewEntity view = new EventViewEntity(eventId, userId);
            eventViewRepository.save(view);

            // Increment the view count
            eventRepository.findById(eventId).ifPresent(event -> {
                long current = Optional.ofNullable(event.getViews()).orElse(0L);
                event.setViews(current + 1);
                eventRepository.save(event);
            });
        }
    }

    /**
     * Get event by ID and track unique view for attendees only.
     * 
     * @deprecated Use trackUniqueView separately instead
     */
    @Deprecated(since = "1.0", forRemoval = true)
    @SuppressWarnings("java:S1133")
    public EventEntity getEventByIdWithUniqueView(Long eventId, Long userId, String userRole) {
        Objects.requireNonNull(eventId, EVENT_ID_MUST_NOT_BE_NULL);
        trackUniqueView(eventId, userId, userRole);
        return eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found with ID: " + eventId));
    }

    @Transactional
    public void deleteEvent(Long id) {
        Objects.requireNonNull(id, EVENT_ID_MUST_NOT_BE_NULL);

        // Check if event has any tickets sold
        long ticketCount = ticketRepository.countByEvent_EventID(id);
        if (ticketCount > 0) {
            throw new IllegalStateException(
                    "Cannot delete event with existing tickets. Use cancel event instead to refund ticket holders.");
        }

        // Delete related records first to avoid FK constraint violations
        attendanceLogRepository.deleteByEventId(id);
        paymentRepository.deleteByEventId(id);
        eventViewRepository.deleteByEventId(id);

        // Now delete the event
        eventRepository.deleteById(id);
    }

    /**
     * Cancel an event and refund all ticket holders.
     * This should be used when an event cannot proceed due to unforeseen
     * circumstances.
     */
    @Transactional
    public CancelEventResponse cancelEvent(Long eventId, String reason) {
        Objects.requireNonNull(eventId, EVENT_ID_MUST_NOT_BE_NULL);

        EventEntity event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found with ID: " + eventId));

        if (event.getStatus() == org.qrush.ticketing_system.entity.EventStatus.CANCELLED) {
            throw new IllegalStateException("Event is already cancelled");
        }

        // Get all tickets for this event
        List<TicketEntity> tickets = ticketRepository.findByEvent_EventID(eventId);

        double totalRefundAmount = 0;
        int ticketsRefunded = 0;

        // Mark all tickets as refunded and notify users
        for (TicketEntity ticket : tickets) {
            if (!"refunded".equalsIgnoreCase(ticket.getStatus()) &&
                !"cancelled".equalsIgnoreCase(ticket.getStatus())) {
            totalRefundAmount += ticket.getPrice();
            ticketsRefunded++;
            // Update ticket status
            ticket.setStatus("refunded"); // Assuming ticket.status is still String
            ticketRepository.save(ticket);
            // Send notification to ticket holder
            notificationService.createEventNotification(
                ticket.getUser().getUserID(),
                "warning",
                "Event Cancelled - Refund Issued",
                String.format("The event \"%s\" has been cancelled. Reason: %s. " +
                    "A refund of ₱%.2f has been issued to your original payment method.",
                    event.getName(),
                    reason != null ? reason : "Unforeseen circumstances",
                    ticket.getPrice()),
                eventId);
            }
        }

        // Update event status
        event.setStatus(org.qrush.ticketing_system.entity.EventStatus.CANCELLED);
        event.setCancellationReason(reason != null ? reason : "Unforeseen circumstances");
        event.setCancelledAt(LocalDateTime.now());
        eventRepository.save(event);

        // Notify the organizer
        if (event.getOrganizer() != null && !event.getOrganizer().isEmpty()) {
            try {
                Long organizerId = Long.parseLong(event.getOrganizer());
                notificationService.createEventNotification(
                        organizerId,
                        "error",
                        "Event Cancelled",
                        String.format(
                                "Your event \"%s\" has been cancelled. %d tickets were refunded for a total of ₱%.2f.",
                                event.getName(), ticketsRefunded, totalRefundAmount),
                        eventId);
            } catch (NumberFormatException e) {
                // Organizer is not a valid user ID, skip notification
            }
        }

        return new CancelEventResponse(
                true,
                String.format("Event cancelled successfully. %d tickets refunded.", ticketsRefunded),
                ticketsRefunded,
                totalRefundAmount);
    }

    /**
     * Check if an event can be deleted (has no tickets sold)
     */
    public boolean canDeleteEvent(Long eventId) {
        Objects.requireNonNull(eventId, EVENT_ID_MUST_NOT_BE_NULL);
        return ticketRepository.countByEvent_EventID(eventId) == 0;
    }
}