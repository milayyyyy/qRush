package org.qrush.ticketing_system.repository;

import org.qrush.ticketing_system.entity.AttendanceLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceLogRepository extends JpaRepository<AttendanceLogEntity, Long> {
	List<AttendanceLogEntity> findByUser_UserIDOrderByStartTimeDesc(Long userId);

	List<AttendanceLogEntity> findByEvent_EventID(Long eventId);

	List<AttendanceLogEntity> findTop25ByEvent_EventIDOrderByStartTimeDesc(Long eventId);

	long countByEvent_EventID(Long eventId);

	long countByEvent_EventIDAndStatusIgnoreCase(Long eventId, String status);

	Optional<AttendanceLogEntity> findTopByTicket_TicketIDOrderByStartTimeDesc(Long ticketId);
}
