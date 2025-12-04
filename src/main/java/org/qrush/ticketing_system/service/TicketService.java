package org.qrush.ticketing_system.service;

import org.qrush.ticketing_system.dto.BookTicketRequest;
import org.qrush.ticketing_system.dto.BulkCheckInRequest;
import org.qrush.ticketing_system.dto.BulkCheckInResponse;
import org.qrush.ticketing_system.dto.ManualTicketVerificationRequest;
import org.qrush.ticketing_system.dto.TicketScanRequest;
import org.qrush.ticketing_system.dto.TicketScanResponse;
import org.qrush.ticketing_system.entity.AttendanceLogEntity;
import org.qrush.ticketing_system.entity.EventEntity;
import org.qrush.ticketing_system.entity.PaymentEntity;
import org.qrush.ticketing_system.entity.TicketEntity;
import org.qrush.ticketing_system.entity.UserEntity;
import org.qrush.ticketing_system.repository.AttendanceLogRepository;
import org.qrush.ticketing_system.repository.EventRepository;
import org.qrush.ticketing_system.repository.PaymentRepository;
import org.qrush.ticketing_system.repository.TicketRepository;
import org.qrush.ticketing_system.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final AttendanceLogRepository attendanceLogRepository;
    private final PaymentRepository paymentRepository;
    private final NotificationService notificationService;
    private static final String TICKET_ID_REQUIRED = "Ticket ID must not be null";
    private static final String USER_ID_REQUIRED = "User ID must not be null";
    private static final String EVENT_ID_REQUIRED = "Event ID must not be null";
    private static final String UPDATED_TICKET_REQUIRED = "Updated ticket must not be null";
    private static final String STATUS_VALID = "valid";
    private static final String STATUS_DUPLICATE = "duplicate";
    private static final String STATUS_INVALID = "invalid";

    public TicketService(TicketRepository ticketRepository,
            UserRepository userRepository,
            EventRepository eventRepository,
            AttendanceLogRepository attendanceLogRepository,
            PaymentRepository paymentRepository,
            NotificationService notificationService) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.attendanceLogRepository = attendanceLogRepository;
        this.paymentRepository = paymentRepository;
        this.notificationService = notificationService;
    }

    public List<TicketEntity> getAllTickets() {
        return ticketRepository.findAll();
    }

    public Optional<TicketEntity> getTicketById(Long id) {
        return ticketRepository.findById(Objects.requireNonNull(id, TICKET_ID_REQUIRED));
    }

    public TicketEntity createTicket(TicketEntity ticket) {
        return ticketRepository.save(Objects.requireNonNull(ticket, "Ticket must not be null"));
    }

    @Transactional
    public List<TicketEntity> bookTickets(BookTicketRequest request) {
        Objects.requireNonNull(request, "Ticket booking request must not be null");
        Long userId = Objects.requireNonNull(request.getUserId(), USER_ID_REQUIRED);
        Long eventId = Objects.requireNonNull(request.getEventId(), EVENT_ID_REQUIRED);

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        EventEntity event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found with ID: " + eventId));

        int quantity = Math.max(1, request.getQuantity());
        String ticketType = Optional.ofNullable(request.getTicketType())
                .filter(type -> !type.isBlank())
                .orElse("REGULAR");

        // Check if enough tickets are available
        int ticketsSold = event.getTicketsSold() != null ? event.getTicketsSold() : 0;
        if (ticketsSold + quantity > event.getCapacity()) {
            throw new IllegalStateException("Not enough tickets available");
        }

        // Increment tickets sold and save event
        event.setTicketsSold(ticketsSold + quantity);
        eventRepository.save(event);

        // Create tickets
        List<TicketEntity> bookedTickets = new ArrayList<>();
        for (int i = 0; i < quantity; i++) {
            TicketEntity ticket = createTicketEntity(user, event, ticketType);
            bookedTickets.add(ticketRepository.save(ticket));
        }

        // Calculate total amount using ticket price from request (for specific ticket
        // type) or event default
        double ticketPrice = request.getTicketPrice() != null ? request.getTicketPrice()
                : (event.getTicketPrice() != null ? event.getTicketPrice() : 0.0);
        float totalAmount = (float) (ticketPrice * quantity);
        if (totalAmount > 0) {
            PaymentEntity payment = new PaymentEntity();
            payment.setUserID(userId);
            payment.setEventID(eventId);
            payment.setAmount(totalAmount);
            payment.setPaymentDate(LocalDateTime.now());
            payment.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "GCASH");
            payment.setPaymentStatus("COMPLETED");
            payment.setTransactionReference(UUID.randomUUID().toString());
            paymentRepository.save(payment);
        }

        // Send notification to user
        String ticketWord = quantity > 1 ? "tickets" : "ticket";
        notificationService.createEventNotification(
                userId,
                "success",
                "Ticket Purchased",
                String.format("Your %d %s %s for \"%s\" %s been confirmed!", quantity, ticketType, ticketWord,
                        event.getName(),
                        quantity > 1 ? "have" : "has"),
                eventId);

        return bookedTickets;
    }

    private TicketEntity createTicketEntity(UserEntity user, EventEntity event, String ticketType) {
        TicketEntity ticket = new TicketEntity();
        ticket.setUser(user);
        ticket.setEvent(event);
        ticket.setTicketType(ticketType);
        ticket.setStatus("ACTIVE");
        ticket.setPrice(event.getTicketPrice());
        ticket.setPurchaseDate(LocalDateTime.now());
        ticket.setQrCode(UUID.randomUUID().toString());
        return ticket;
    }

    public TicketEntity updateTicket(Long id, TicketEntity updatedTicket) {
        Objects.requireNonNull(id, TICKET_ID_REQUIRED);
        Objects.requireNonNull(updatedTicket, UPDATED_TICKET_REQUIRED);
        return ticketRepository.findById(id).map(ticket -> {
            ticket.setUser(updatedTicket.getUser());
            ticket.setEvent(updatedTicket.getEvent());
            ticket.setQrCode(updatedTicket.getQrCode());
            ticket.setPrice(updatedTicket.getPrice());
            ticket.setPurchaseDate(updatedTicket.getPurchaseDate());
            ticket.setTicketType(updatedTicket.getTicketType());
            ticket.setStatus(updatedTicket.getStatus());
            return ticketRepository.save(ticket);
        }).orElseThrow(() -> new RuntimeException("Ticket not found with ID: " + id));
    }

    public void deleteTicket(Long id) {
        ticketRepository.deleteById(Objects.requireNonNull(id, TICKET_ID_REQUIRED));
    }

    @Transactional
    public TicketScanResponse scanTicket(TicketScanRequest request) {
        Objects.requireNonNull(request, "Ticket scan request must not be null");

        String qrCode = Optional.ofNullable(request.qrCode())
                .map(String::trim)
                .orElse("");
        if (qrCode.isEmpty()) {
            throw new IllegalArgumentException("QR code must not be empty");
        }

        String gate = normaliseGate(request.gate());
        LocalDateTime scannedAt = LocalDateTime.now();

        Optional<TicketEntity> ticketOptional = ticketRepository.findByQrCode(qrCode);
        if (ticketOptional.isEmpty()) {
            return buildInvalidResponse("No ticket matches the scanned code.", gate, scannedAt);
        }

        return processTicketEntry(ticketOptional.get(), gate, scannedAt);
    }

    @Transactional
    public TicketScanResponse verifyTicketManually(ManualTicketVerificationRequest request) {
        Objects.requireNonNull(request, "Manual ticket verification request must not be null");

        String gate = normaliseGate(request.gate());
        LocalDateTime scannedAt = LocalDateTime.now();
        return verifyTicketByNumberInternal(request, gate, scannedAt);
    }

    @Transactional
    public BulkCheckInResponse bulkCheckIn(BulkCheckInRequest request) {
        Objects.requireNonNull(request, "Bulk check-in request must not be null");

        List<String> ticketNumbers = ManualTicketVerificationRequest.normaliseTicketNumbers(request);
        if (ticketNumbers.isEmpty()) {
            return new BulkCheckInResponse(0, 0, 0, 0, List.of());
        }

        String gate = normaliseGate(request.gate());
        List<TicketScanResponse> results = new ArrayList<>();
        int successful = 0;
        int duplicates = 0;
        int invalid = 0;

        for (String ticketNumber : ticketNumbers) {
            ManualTicketVerificationRequest singleRequest = ManualTicketVerificationRequest.fromBulk(ticketNumber,
                    request);
            TicketScanResponse response = verifyTicketByNumberInternal(singleRequest, gate, LocalDateTime.now());
            results.add(response);

            String status = Optional.ofNullable(response.status()).orElse("").toLowerCase();
            if (status.equals(STATUS_VALID)) {
                successful++;
            } else if (status.equals(STATUS_DUPLICATE)) {
                duplicates++;
            } else {
                invalid++;
            }
        }

        return new BulkCheckInResponse(results.size(), successful, duplicates, invalid, results);
    }

    private TicketScanResponse verifyTicketByNumberInternal(ManualTicketVerificationRequest request,
            String gate,
            LocalDateTime scannedAt) {
        Long ticketId = extractTicketId(request.ticketNumber());
        if (ticketId == null) {
            return buildInvalidResponse("Ticket number is invalid.", gate, scannedAt);
        }

        TicketEntity ticket = ticketRepository.findById(ticketId).orElse(null);
        if (ticket == null) {
            return buildInvalidResponse("Ticket number not found.", gate, scannedAt);
        }

        EventEntity event = ticket.getEvent();
        if (event == null) {
            return buildInvalidResponse("Ticket is not linked to an event.", gate, scannedAt);
        }

        if (request.eventId() != null && !event.getEventID().equals(request.eventId())) {
            return buildInvalidResponse("Ticket belongs to a different event.", gate, scannedAt);
        }

        return processTicketEntry(ticket, gate, scannedAt);
    }

    private String normaliseGate(String gate) {
        return Optional.ofNullable(gate)
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .orElse("Main Gate");
    }

    private TicketScanResponse buildInvalidResponse(String message, String gate, LocalDateTime scannedAt) {
        return new TicketScanResponse(
                STATUS_INVALID,
                message,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                gate,
                0,
                false,
                scannedAt,
                null);
    }

    private TicketScanResponse processTicketEntry(TicketEntity ticket, String gate, LocalDateTime scannedAt) {
        AttendanceLogEntity latestLog = attendanceLogRepository
                .findTopByTicket_TicketIDOrderByStartTimeDesc(ticket.getTicketID())
                .orElse(null);

        boolean alreadyCheckedIn = Optional.ofNullable(ticket.getStatus())
                .map(status -> status.equalsIgnoreCase("CHECKED_IN") || status.equalsIgnoreCase("USED"))
                .orElse(false);

        AttendanceLogEntity logEntry = new AttendanceLogEntity();
        logEntry.setTicket(ticket);
        logEntry.setEvent(ticket.getEvent());
        logEntry.setUser(ticket.getUser());
        logEntry.setStartTime(scannedAt);
        logEntry.setGate(gate);

        int reEntryCount;
        String status;
        String message;

        if (alreadyCheckedIn) {
            status = STATUS_DUPLICATE;
            message = "Ticket was already checked in.";
            int previousReEntry = Optional.ofNullable(latestLog)
                    .map(AttendanceLogEntity::getReEntry)
                    .orElse(0);
            reEntryCount = previousReEntry + 1;
            logEntry.setStatus(STATUS_DUPLICATE);
            logEntry.setReEntry(reEntryCount);
        } else {
            status = STATUS_VALID;
            message = "Ticket verified successfully.";
            reEntryCount = 0;
            logEntry.setStatus(STATUS_VALID);
            logEntry.setReEntry(reEntryCount);
            ticket.setStatus("CHECKED_IN");
            ticketRepository.save(ticket);

            // Send notification to attendee about successful check-in
            if (ticket.getUser() != null && ticket.getEvent() != null) {
                notificationService.createEventNotification(
                        ticket.getUser().getUserID(),
                        "success",
                        "Checked In",
                        String.format("You've been checked in to \"%s\" at %s. Enjoy the event!",
                                ticket.getEvent().getName(), gate),
                        ticket.getEvent().getEventID());
            }
        }

        attendanceLogRepository.save(logEntry);

        EventEntity event = ticket.getEvent();
        UserEntity attendee = ticket.getUser();

        return new TicketScanResponse(
                status,
                message,
                ticket.getTicketID(),
                event != null ? event.getEventID() : null,
                formatTicketNumber(ticket),
                attendee != null ? attendee.getName() : "",
                attendee != null ? attendee.getEmail() : "",
                event != null ? event.getName() : "",
                event != null ? event.getStartDate() : null,
                event != null ? event.getEndDate() : null,
                gate,
                reEntryCount,
                alreadyCheckedIn,
                scannedAt,
                Optional.ofNullable(latestLog).map(AttendanceLogEntity::getStartTime).orElse(null));
    }

    private Long extractTicketId(String ticketNumber) {
        if (ticketNumber == null) {
            return null;
        }
        String trimmed = ticketNumber.trim();
        if (trimmed.isEmpty()) {
            return null;
        }

        String[] parts = trimmed.split("-");
        String numericSegment = parts[parts.length - 1].replaceAll("\\D", "");
        if (numericSegment.isEmpty()) {
            return null;
        }

        try {
            long id = Long.parseLong(numericSegment);
            return id > 0 ? id : null;
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private String formatTicketNumber(TicketEntity ticket) {
        if (ticket == null || ticket.getTicketID() == null) {
            return "";
        }
        String prefix = Objects.toString(ticket.getTicketType(), "TICKET");
        return "%s-%06d".formatted(prefix.replaceAll("\\s+", "").toUpperCase(), ticket.getTicketID());
    }
}
