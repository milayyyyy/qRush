package org.qrush.ticketing_system.repository;

import org.qrush.ticketing_system.entity.TicketEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<TicketEntity, Long> {
	List<TicketEntity> findByUser_UserID(Long userId);

	List<TicketEntity> findByEvent_EventID(Long eventId);

	long countByEvent_EventID(Long eventId);

	long countByUser_UserID(Long userId);

	@Query("SELECT COALESCE(SUM(t.price), 0) FROM TicketEntity t WHERE t.user.userID = :userId")
	Double sumPriceByUser(@Param("userId") Long userId);

	@Query("SELECT COALESCE(SUM(t.price), 0) FROM TicketEntity t WHERE t.event.eventID = :eventId")
	Double sumRevenueByEvent(@Param("eventId") Long eventId);

	Optional<TicketEntity> findByQrCode(String qrCode);
}
