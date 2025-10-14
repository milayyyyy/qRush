package org.qrush.ticketing_system.repository;

import org.qrush.ticketing_system.entity.PaymentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<PaymentEntity, Long> {

    List<PaymentEntity> findByUserID(Long userID);

    List<PaymentEntity> findByEventID(Long eventID);

    PaymentEntity findByTransactionReference(String transactionReference);
}
