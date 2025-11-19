package org.qrush.ticketing_system.service;

import org.qrush.ticketing_system.dto.dashboard.AttendeeDashboardResponse;
import org.qrush.ticketing_system.dto.dashboard.OrganizerDashboardResponse;
import org.qrush.ticketing_system.dto.dashboard.StaffDashboardResponse;
import org.qrush.ticketing_system.entity.AttendanceLogEntity;
import org.qrush.ticketing_system.entity.EventEntity;
import org.qrush.ticketing_system.entity.TicketEntity;
import org.qrush.ticketing_system.entity.UserEntity;
import org.qrush.ticketing_system.repository.AttendanceLogRepository;
import org.qrush.ticketing_system.repository.EventRepository;
import org.qrush.ticketing_system.repository.TicketRepository;
import org.qrush.ticketing_system.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final TicketRepository ticketRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final AttendanceLogRepository attendanceLogRepository;
        private static final String USER_ID_REQUIRED = "User ID must not be null";
        private static final String EVENT_ID_REQUIRED = "Event ID must not be null";

    public DashboardService(TicketRepository ticketRepository,
                            EventRepository eventRepository,
                            UserRepository userRepository,
                            AttendanceLogRepository attendanceLogRepository) {
        this.ticketRepository = ticketRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
        this.attendanceLogRepository = attendanceLogRepository;
    }

    public AttendeeDashboardResponse getAttendeeDashboard(Long userId) {
        Long validatedUserId = Objects.requireNonNull(userId, USER_ID_REQUIRED);
        List<TicketEntity> tickets = ticketRepository.findByUser_UserID(validatedUserId);
        List<AttendanceLogEntity> attendanceLogs = attendanceLogRepository
                .findByUser_UserIDOrderByStartTimeDesc(validatedUserId);

        Set<Long> attendedEventIds = attendanceLogs.stream()
                .map(log -> log.getEvent().getEventID())
                .collect(Collectors.toCollection(LinkedHashSet::new));

        double totalSpent = Optional.ofNullable(ticketRepository.sumPriceByUser(validatedUserId)).orElse(0.0d);

        LocalDateTime now = LocalDateTime.now();
        List<AttendeeDashboardResponse.TicketSummary> upcomingTickets = tickets.stream()
                .filter(ticket -> Optional.ofNullable(ticket.getEvent())
                        .map(EventEntity::getStartDate)
                        .map(start -> start.isAfter(now))
                        .orElse(false))
                .sorted(Comparator.comparing(ticket -> ticket.getEvent().getStartDate()))
                .map(this::toTicketSummary)
                .toList();

        Map<Long, AttendeeDashboardResponse.EventHistorySummary> historyMap = new LinkedHashMap<>();
        for (TicketEntity ticket : tickets) {
            EventEntity event = ticket.getEvent();
            if (event == null) {
                continue;
            }

            if (event.getEndDate() != null && event.getEndDate().isBefore(now)) {
                boolean attended = attendedEventIds.contains(event.getEventID());
                historyMap.putIfAbsent(event.getEventID(),
                        new AttendeeDashboardResponse.EventHistorySummary(
                                event.getEventID(),
                                event.getName(),
                                event.getEndDate(),
                                event.getLocation(),
                                attended
                        ));
            }
        }

        return new AttendeeDashboardResponse(
                upcomingTickets.size(),
                attendedEventIds.size(),
                totalSpent,
                upcomingTickets,
                new ArrayList<>(historyMap.values())
        );
    }

    public OrganizerDashboardResponse getOrganizerDashboard(Long userId) {
        Long validatedUserId = Objects.requireNonNull(userId, USER_ID_REQUIRED);
        UserEntity organizer = userRepository.findById(validatedUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        Set<EventEntity> events = new LinkedHashSet<>();
        events.addAll(eventRepository.findByOrganizerIdentifier(organizer.getName()));
        events.addAll(eventRepository.findByOrganizerIdentifier(organizer.getEmail()));

        List<OrganizerDashboardResponse.EventSummary> eventSummaries = events.stream()
                .map(event -> {
                    long ticketsSold = ticketRepository.countByEvent_EventID(event.getEventID());
                    double revenue = Optional.ofNullable(ticketRepository.sumRevenueByEvent(event.getEventID())).orElse(0.0d);
                    int capacity = Optional.ofNullable(event.getCapacity()).orElse(0);
                    long views = Optional.ofNullable(event.getViews()).orElse(0L);
                    return new OrganizerDashboardResponse.EventSummary(
                            event.getEventID(),
                            event.getName(),
                            event.getStartDate(),
                            event.getEndDate(),
                            "published",
                            ticketsSold,
                            capacity,
                            revenue,
                            views
                    );
                })
                .sorted(Comparator.comparing(OrganizerDashboardResponse.EventSummary::eventStart))
                .toList();

        long totalTicketsSold = eventSummaries.stream()
                .mapToLong(OrganizerDashboardResponse.EventSummary::ticketsSold)
                .sum();

        double totalRevenue = eventSummaries.stream()
                .mapToDouble(OrganizerDashboardResponse.EventSummary::revenue)
                .sum();

        double averageAttendance = eventSummaries.stream()
                .mapToDouble(summary -> summary.capacity() > 0
                        ? (double) summary.ticketsSold() / summary.capacity() * 100
                        : 0)
                .average()
                .orElse(0.0d);

        return new OrganizerDashboardResponse(
                eventSummaries.size(),
                totalTicketsSold,
                totalRevenue,
                (int) Math.round(averageAttendance),
                eventSummaries
        );
    }

    public StaffDashboardResponse getStaffDashboard(Long eventId) {
        Long validatedEventId = Objects.requireNonNull(eventId, EVENT_ID_REQUIRED);
        EventEntity event = eventRepository.findById(validatedEventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found with ID: " + eventId));

        List<TicketEntity> tickets = ticketRepository.findByEvent_EventID(validatedEventId);
        List<AttendanceLogEntity> allLogs = attendanceLogRepository.findByEvent_EventID(validatedEventId);
        List<AttendanceLogEntity> recentLogs = attendanceLogRepository
                .findTop25ByEvent_EventIDOrderByStartTimeDesc(validatedEventId);

        long ticketsSold = tickets.size();
        long checkedIn = allLogs.stream()
                .filter(log -> {
                    String status = log.getStatus();
                    if (status == null) {
                        return false;
                    }
                    String normalized = status.toLowerCase();
                    return normalized.contains("valid") || normalized.contains("checked");
                })
                .count();

        long pending = Math.max(ticketsSold - checkedIn, 0);

        List<StaffDashboardResponse.ScanRecord> scans = recentLogs.stream()
                .map(log -> {
                    TicketEntity ticket = log.getTicket();
                    UserEntity attendee = ticket != null ? ticket.getUser() : null;
                    return new StaffDashboardResponse.ScanRecord(
                            log.getLogID(),
                            ticket != null ? ticket.getTicketID() : null,
                            formatTicketNumber(ticket),
                            attendee != null ? attendee.getName() : "",
                            attendee != null ? attendee.getEmail() : "",
                            log.getStartTime(),
                            log.getStatus(),
                            Optional.ofNullable(log.getStatus()).orElse("Main Gate")
                    );
                })
                .toList();

        StaffDashboardResponse.EventInfo eventInfo = new StaffDashboardResponse.EventInfo(
                event.getEventID(),
                event.getName(),
                event.getStartDate(),
                event.getEndDate(),
                event.getLocation()
        );

        return new StaffDashboardResponse(
                eventInfo,
                Optional.ofNullable(event.getCapacity()).orElse(0),
                ticketsSold,
                checkedIn,
                pending,
                scans
        );
    }

    private AttendeeDashboardResponse.TicketSummary toTicketSummary(TicketEntity ticket) {
        EventEntity event = ticket.getEvent();
        String ticketNumber = formatTicketNumber(ticket);
        return new AttendeeDashboardResponse.TicketSummary(
                ticket.getTicketID(),
                event != null ? event.getEventID() : null,
                event != null ? event.getName() : "",
                event != null ? event.getStartDate() : null,
                event != null ? event.getEndDate() : null,
                event != null ? event.getLocation() : "",
                ticketNumber,
                ticket.getQrCode(),
                ticket.getPrice(),
                ticket.getStatus()
        );
    }

    private String formatTicketNumber(TicketEntity ticket) {
        if (ticket == null || ticket.getTicketID() == null) {
            return "";
        }
        String prefix = Objects.toString(ticket.getTicketType(), "TICKET");
        return "%s-%06d".formatted(prefix.replaceAll("\\s+", "").toUpperCase(), ticket.getTicketID());
    }

    public String formatEventTimeRange(EventEntity event) {
        if (event == null || event.getStartDate() == null || event.getEndDate() == null) {
            return "";
        }
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("hh:mm a");
        return "%s - %s".formatted(
                event.getStartDate().format(formatter),
                event.getEndDate().format(formatter)
        );
    }
}
