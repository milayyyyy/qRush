package org.qrush.ticketing_system.service;

import org.qrush.ticketing_system.entity.AttendanceLogEntity;
import org.qrush.ticketing_system.repository.AttendanceLogRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class AttendanceLogService {
    @org.springframework.beans.factory.annotation.Value("${event.scan.window.before.hours:2}")
    private int scanWindowBeforeHours;

    @org.springframework.beans.factory.annotation.Value("${event.scan.window.after.hours:2}")
    private int scanWindowAfterHours;

    /**
     * Returns true if the current time is within the scan window for the event.
     */
    public boolean isWithinScanWindow(java.time.LocalDateTime now, org.qrush.ticketing_system.entity.EventEntity event) {
        java.time.LocalDateTime windowStart = event.getStartDate().minusHours(scanWindowBeforeHours);
        java.time.LocalDateTime windowEnd = event.getEndDate().plusHours(scanWindowAfterHours);
        return (now.isEqual(windowStart) || now.isAfter(windowStart)) && (now.isEqual(windowEnd) || now.isBefore(windowEnd));
    }

    private final AttendanceLogRepository attendanceLogRepository;
    private static final String LOG_ID_REQUIRED = "Attendance log ID must not be null";
    private static final String USER_ID_REQUIRED = "User ID must not be null";
    private static final String EVENT_ID_REQUIRED = "Event ID must not be null";

    public AttendanceLogService(AttendanceLogRepository attendanceLogRepository) {
        this.attendanceLogRepository = attendanceLogRepository;
    }

    public List<AttendanceLogEntity> getAllLogs() {
        return attendanceLogRepository.findAll();
    }

    public Optional<AttendanceLogEntity> getLogById(Long id) {
        return attendanceLogRepository.findById(Objects.requireNonNull(id, LOG_ID_REQUIRED));
    }

    public List<AttendanceLogEntity> getLogsByUser(Long userId) {
        Objects.requireNonNull(userId, USER_ID_REQUIRED);
        return attendanceLogRepository.findByUser_UserIDOrderByStartTimeDesc(userId);
    }

    public List<AttendanceLogEntity> getLogsByEvent(Long eventId) {
        Objects.requireNonNull(eventId, EVENT_ID_REQUIRED);
        return attendanceLogRepository.findByEvent_EventID(eventId);
    }

    public List<AttendanceLogEntity> getRecentLogsByEvent(Long eventId) {
        Objects.requireNonNull(eventId, EVENT_ID_REQUIRED);
        return attendanceLogRepository.findTop25ByEvent_EventIDOrderByStartTimeDesc(eventId);
    }

    public long getCheckInCountByEvent(Long eventId) {
        Objects.requireNonNull(eventId, EVENT_ID_REQUIRED);
        return attendanceLogRepository.countByEvent_EventIDAndStatusIgnoreCase(eventId, "valid");
    }

    public long getTotalLogsByEvent(Long eventId) {
        Objects.requireNonNull(eventId, EVENT_ID_REQUIRED);
        return attendanceLogRepository.countByEvent_EventID(eventId);
    }

    public AttendanceLogEntity createLog(AttendanceLogEntity log) {
        return attendanceLogRepository.save(Objects.requireNonNull(log, "Attendance log must not be null"));
    }

    public AttendanceLogEntity updateLog(Long id, AttendanceLogEntity updatedLog) {
        Objects.requireNonNull(id, LOG_ID_REQUIRED);
        Objects.requireNonNull(updatedLog, "Updated attendance log must not be null");
        return attendanceLogRepository.findById(id).map(log -> {
            log.setTicket(updatedLog.getTicket());
            log.setEvent(updatedLog.getEvent());
            log.setUser(updatedLog.getUser());
            log.setStartTime(updatedLog.getStartTime());
            log.setStatus(updatedLog.getStatus());
            log.setReEntry(updatedLog.getReEntry());
            log.setGate(updatedLog.getGate());
            return attendanceLogRepository.save(log);
        }).orElseThrow(() -> new RuntimeException("Log not found with ID: " + id));
    }

    public void deleteLog(Long id) {
        attendanceLogRepository.deleteById(Objects.requireNonNull(id, LOG_ID_REQUIRED));
    }
}
