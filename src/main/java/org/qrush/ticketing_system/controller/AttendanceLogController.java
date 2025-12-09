package org.qrush.ticketing_system.controller;

import org.qrush.ticketing_system.entity.AttendanceLogEntity;
import org.qrush.ticketing_system.service.AttendanceLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceLogController {

    private final AttendanceLogService attendanceLogService;

    public AttendanceLogController(AttendanceLogService attendanceLogService) {
        this.attendanceLogService = attendanceLogService;
    }

    @GetMapping
    public ResponseEntity<List<AttendanceLogEntity>> getAllLogs() {
        return ResponseEntity.ok(attendanceLogService.getAllLogs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AttendanceLogEntity> getLogById(@PathVariable Long id) {
        return attendanceLogService.getLogById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AttendanceLogEntity>> getLogsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(attendanceLogService.getLogsByUser(userId));
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<AttendanceLogEntity>> getLogsByEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(attendanceLogService.getLogsByEvent(eventId));
    }

    @GetMapping("/event/{eventId}/recent")
    public ResponseEntity<List<AttendanceLogEntity>> getRecentLogsByEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(attendanceLogService.getRecentLogsByEvent(eventId));
    }

    @GetMapping("/event/{eventId}/stats")
    public ResponseEntity<Map<String, Long>> getEventAttendanceStats(@PathVariable Long eventId) {
        long checkInCount = attendanceLogService.getCheckInCountByEvent(eventId);
        long totalLogs = attendanceLogService.getTotalLogsByEvent(eventId);
        return ResponseEntity.ok(Map.of(
                "checkInCount", checkInCount,
                "totalLogs", totalLogs));
    }

    @PostMapping
    public ResponseEntity<AttendanceLogEntity> createLog(@RequestBody AttendanceLogEntity log) {
        // Scan window check
        if (log.getEvent() == null || log.getStartTime() == null) {
            return ResponseEntity.badRequest().build();
        }
        java.time.LocalDateTime now = log.getStartTime();
        if (!attendanceLogService.isWithinScanWindow(now, log.getEvent())) {
            return ResponseEntity.status(403).body(null); // Forbidden: outside scan window
        }
        return ResponseEntity.ok(attendanceLogService.createLog(log));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AttendanceLogEntity> updateLog(@PathVariable Long id,
            @RequestBody AttendanceLogEntity updatedLog) {
        return ResponseEntity.ok(attendanceLogService.updateLog(id, updatedLog));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLog(@PathVariable Long id) {
        attendanceLogService.deleteLog(id);
        return ResponseEntity.noContent().build();
    }
}
