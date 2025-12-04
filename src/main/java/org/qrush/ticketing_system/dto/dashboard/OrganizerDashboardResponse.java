package org.qrush.ticketing_system.dto.dashboard;

import java.time.LocalDateTime;
import java.util.List;

public record OrganizerDashboardResponse(
                int totalEvents,
                long totalTicketsSold,
                double totalRevenue,
                int averageAttendance,
                List<EventSummary> events) {
        public record EventSummary(
                        Long eventId,
                        String title,
                        LocalDateTime eventStart,
                        LocalDateTime eventEnd,
                        String status,
                        long ticketsSold,
                        int capacity,
                        double revenue,
                        long views,
                        String cancellationReason) {
        }
}
