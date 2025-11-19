package org.qrush.ticketing_system.service;

import org.qrush.ticketing_system.entity.EventEntity;
import org.qrush.ticketing_system.repository.EventRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private static final String EVENT_ID_MUST_NOT_BE_NULL = "Event ID must not be null";

    public EventService(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
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
        return eventRepository.save(toCreate);
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

    public void deleteEvent(Long id) {
        eventRepository.deleteById(Objects.requireNonNull(id, EVENT_ID_MUST_NOT_BE_NULL));
    }
}
