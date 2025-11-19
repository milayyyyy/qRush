package org.qrush.ticketing_system.service;

import org.qrush.ticketing_system.entity.AttendanceLogEntity;
import org.qrush.ticketing_system.repository.AttendanceLogRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class AttendanceLogService {

    private final AttendanceLogRepository attendanceLogRepository;
    private static final String LOG_ID_REQUIRED = "Attendance log ID must not be null";

    public AttendanceLogService(AttendanceLogRepository attendanceLogRepository) {
        this.attendanceLogRepository = attendanceLogRepository;
    }

    public List<AttendanceLogEntity> getAllLogs() {
        return attendanceLogRepository.findAll();
    }

    public Optional<AttendanceLogEntity> getLogById(Long id) {
        return attendanceLogRepository.findById(Objects.requireNonNull(id, LOG_ID_REQUIRED));
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
            return attendanceLogRepository.save(log);
        }).orElseThrow(() -> new RuntimeException("Log not found with ID: " + id));
    }

    public void deleteLog(Long id) {
        attendanceLogRepository.deleteById(Objects.requireNonNull(id, LOG_ID_REQUIRED));
    }
}
