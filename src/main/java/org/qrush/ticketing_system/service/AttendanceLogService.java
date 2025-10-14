package org.qrush.ticketing_system.service;

import org.qrush.ticketing_system.entity.AttendanceLogEntity;
import org.qrush.ticketing_system.repository.AttendanceLogRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AttendanceLogService {

    private final AttendanceLogRepository attendanceLogRepository;

    public AttendanceLogService(AttendanceLogRepository attendanceLogRepository) {
        this.attendanceLogRepository = attendanceLogRepository;
    }

    public List<AttendanceLogEntity> getAllLogs() {
        return attendanceLogRepository.findAll();
    }

    public Optional<AttendanceLogEntity> getLogById(Long id) {
        return attendanceLogRepository.findById(id);
    }

    public AttendanceLogEntity createLog(AttendanceLogEntity log) {
        return attendanceLogRepository.save(log);
    }

    public AttendanceLogEntity updateLog(Long id, AttendanceLogEntity updatedLog) {
        return attendanceLogRepository.findById(id).map(log -> {
            log.setTicket(updatedLog.getTicket());
            log.setEvent(updatedLog.getEvent());
            log.setUser(updatedLog.getUser());
            log.setStart_time(updatedLog.getStart_time());
            log.setStatus(updatedLog.getStatus());
            log.setRe_entry(updatedLog.getRe_entry());
            return attendanceLogRepository.save(log);
        }).orElseThrow(() -> new RuntimeException("Log not found with ID: " + id));
    }

    public void deleteLog(Long id) {
        attendanceLogRepository.deleteById(id);
    }
}
