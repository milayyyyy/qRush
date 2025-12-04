package org.qrush.ticketing_system.service;

import org.qrush.ticketing_system.entity.NotificationEntity;
import org.qrush.ticketing_system.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    /**
     * Get all notifications for a user
     */
    public List<NotificationEntity> getNotificationsByUserId(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(
                Objects.requireNonNull(userId, "User ID must not be null"));
    }

    /**
     * Get unread notifications for a user
     */
    public List<NotificationEntity> getUnreadNotificationsByUserId(Long userId) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(
                Objects.requireNonNull(userId, "User ID must not be null"));
    }

    /**
     * Get unread notification count for a user
     */
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(
                Objects.requireNonNull(userId, "User ID must not be null"));
    }

    /**
     * Create a new notification
     */
    public NotificationEntity createNotification(NotificationEntity notification) {
        Objects.requireNonNull(notification, "Notification must not be null");
        Objects.requireNonNull(notification.getUserId(), "User ID must not be null");
        Objects.requireNonNull(notification.getTitle(), "Title must not be null");
        Objects.requireNonNull(notification.getMessage(), "Message must not be null");

        if (notification.getType() == null) {
            notification.setType("info");
        }
        if (notification.getIsRead() == null) {
            notification.setIsRead(false);
        }

        return notificationRepository.save(notification);
    }

    /**
     * Create a notification with specific parameters
     */
    public NotificationEntity createNotification(Long userId, String type, String title, String message) {
        NotificationEntity notification = new NotificationEntity();
        notification.setUserId(userId);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setIsRead(false);
        return notificationRepository.save(notification);
    }

    /**
     * Create a notification linked to an event
     */
    public NotificationEntity createEventNotification(Long userId, String type, String title, String message,
            Long eventId) {
        NotificationEntity notification = new NotificationEntity();
        notification.setUserId(userId);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setRelatedEventId(eventId);
        notification.setIsRead(false);
        return notificationRepository.save(notification);
    }

    /**
     * Create a notification linked to a ticket
     */
    public NotificationEntity createTicketNotification(Long userId, String type, String title, String message,
            Long ticketId) {
        NotificationEntity notification = new NotificationEntity();
        notification.setUserId(userId);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setRelatedTicketId(ticketId);
        notification.setIsRead(false);
        return notificationRepository.save(notification);
    }

    /**
     * Mark a single notification as read
     */
    public Optional<NotificationEntity> markAsRead(Long notificationId) {
        return notificationRepository.findById(notificationId).map(notification -> {
            notification.setIsRead(true);
            return notificationRepository.save(notification);
        });
    }

    /**
     * Mark all notifications as read for a user
     */
    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadByUserId(
                Objects.requireNonNull(userId, "User ID must not be null"));
    }

    /**
     * Delete a single notification
     */
    public void deleteNotification(Long notificationId) {
        notificationRepository.deleteById(notificationId);
    }

    /**
     * Delete all notifications for a user
     */
    @Transactional
    public void deleteAllByUserId(Long userId) {
        notificationRepository.deleteByUserId(
                Objects.requireNonNull(userId, "User ID must not be null"));
    }
}
