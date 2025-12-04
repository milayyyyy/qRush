package org.qrush.ticketing_system.repository;

import org.qrush.ticketing_system.entity.NotificationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<NotificationEntity, Long> {

    // Find all notifications for a user, ordered by creation date (newest first)
    List<NotificationEntity> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Find unread notifications for a user
    List<NotificationEntity> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);

    // Count unread notifications for a user
    long countByUserIdAndIsReadFalse(Long userId);

    // Mark all notifications as read for a user
    @Modifying
    @Query("UPDATE NotificationEntity n SET n.isRead = true WHERE n.userId = :userId")
    void markAllAsReadByUserId(@Param("userId") Long userId);

    // Delete all notifications for a user
    void deleteByUserId(Long userId);
}
