package org.qrush.ticketing_system.dto.dashboard;

import java.time.LocalDateTime;
import java.util.List;

public record AttendeeDashboardResponse(
                int activeTickets,
                int eventsAttended,
                double totalSpent,
                List<TicketSummary> upcomingTickets,
                List<EventHistorySummary> pastEvents) {
        public record TicketSummary(
                        Long ticketId,
                        Long eventId,
                        String eventTitle,
                        LocalDateTime eventStart,
                        LocalDateTime eventEnd,
                        String location,
                        String ticketNumber,
                        String qrCode,
                        Double price,
                        String status,
                        String eventStatus,
                        String eventCancellationReason) {
        }

        public record EventHistorySummary(
                        Long eventId,
                        String eventTitle,
                        LocalDateTime eventDate,
                        String location,
                        boolean attended) {
        }
}
