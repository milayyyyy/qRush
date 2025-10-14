package org.qrush.ticketing_system.repository;

import org.qrush.ticketing_system.entity.AttendanceLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AttendanceLogRepository extends JpaRepository<AttendanceLogEntity, Long> {
}
