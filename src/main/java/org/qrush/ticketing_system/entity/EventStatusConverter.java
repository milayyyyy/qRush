package org.qrush.ticketing_system.entity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.time.LocalDateTime;

@Converter(autoApply = false)
public class EventStatusConverter implements AttributeConverter<EventStatus, String> {

    @Override
    public String convertToDatabaseColumn(EventStatus attribute) {
        return attribute == null ? null : attribute.name();
    }

    @Override
    public EventStatus convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        String normalized = dbData.trim().toUpperCase();
        // map legacy values to new enum
        switch (normalized) {
            case "ACTIVE":
            case "PUBLISHED":
            case "PUBLIC":
            case "AVAILABLE":
                return EventStatus.AVAILABLE;
            case "ENDED":
            case "EXPIRED":
                return EventStatus.ENDED;
            case "CANCELLED":
            case "CANCELED":
                return EventStatus.CANCELLED;
            case "ARCHIVED":
                return EventStatus.ARCHIVED;
            default:
                // unknown values -> AVAILABLE by default
                return EventStatus.AVAILABLE;
        }
    }
}
