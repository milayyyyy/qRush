package org.qrush.ticketing_system.repository;

import org.qrush.ticketing_system.entity.EventViewEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EventViewRepository extends JpaRepository<EventViewEntity, Long> {

    Optional<EventViewEntity> findByEventIdAndUserId(Long eventId, Long userId);

    boolean existsByEventIdAndUserId(Long eventId, Long userId);

    long countByEventId(Long eventId);

    void deleteByEventId(Long eventId);
}
