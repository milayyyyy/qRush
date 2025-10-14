package org.qrush.ticketing_system.controller;

import org.qrush.ticketing_system.entity.AttendanceLogEntity;
import org.qrush.ticketing_system.service.AttendanceLogService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceLogController {

    private final AttendanceLogService attendanceLogService;

    public AttendanceLogController(AttendanceLogService attendanceLogService) {
        this.attendanceLogService = attendanceLogService;
    }

    @GetMapping
    public List<AttendanceLogEntity> getAllLogs() {
        return attendanceLogService.getAllLogs();
    }

    @GetMapping("/{id}")
    public AttendanceLogEntity getLogById(@PathVariable Long id) {
        return attendanceLogService.getLogById(id)
                .orElseThrow(() -> new RuntimeException("Log not found with ID: " + id));
    }

    @PostMapping
    public AttendanceLogEntity createLog(@RequestBody AttendanceLogEntity log) {
        return attendanceLogService.createLog(log);
    }

    @PutMapping("/{id}")
    public AttendanceLogEntity updateLog(@PathVariable Long id, @RequestBody AttendanceLogEntity updatedLog) {
        return attendanceLogService.updateLog(id, updatedLog);
    }

    @DeleteMapping("/{id}")
    public void deleteLog(@PathVariable Long id) {
        attendanceLogService.deleteLog(id);
    }
}
