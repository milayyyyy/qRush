package org.qrush.ticketing_system.service;

import org.qrush.ticketing_system.entity.PaymentEntity;
import org.qrush.ticketing_system.repository.PaymentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private static final String PAYMENT_ID_REQUIRED = "Payment ID must not be null";
    private static final String USER_ID_REQUIRED = "User ID must not be null";
    private static final String EVENT_ID_REQUIRED = "Event ID must not be null";
    private static final String TRANSACTION_REFERENCE_REQUIRED = "Transaction reference must not be null";

    public PaymentService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    public List<PaymentEntity> getAllPayments() {
        return paymentRepository.findAll();
    }

    public Optional<PaymentEntity> getPaymentById(Long id) {
        return paymentRepository.findById(Objects.requireNonNull(id, PAYMENT_ID_REQUIRED));
    }

    public List<PaymentEntity> getPaymentsByUser(Long userID) {
        return paymentRepository.findByUserID(Objects.requireNonNull(userID, USER_ID_REQUIRED));
    }

    public List<PaymentEntity> getPaymentsByEvent(Long eventID) {
        return paymentRepository.findByEventID(Objects.requireNonNull(eventID, EVENT_ID_REQUIRED));
    }

    public PaymentEntity getPaymentByTransactionReference(String reference) {
        return paymentRepository.findByTransactionReference(Objects.requireNonNull(reference, TRANSACTION_REFERENCE_REQUIRED));
    }

    public PaymentEntity createPayment(PaymentEntity payment) {
        return paymentRepository.save(Objects.requireNonNull(payment, "Payment must not be null"));
    }

    public PaymentEntity updatePayment(Long id, PaymentEntity updatedPayment) {
        Objects.requireNonNull(id, PAYMENT_ID_REQUIRED);
        Objects.requireNonNull(updatedPayment, "Updated payment must not be null");
        return paymentRepository.findById(id).map(payment -> {
            payment.setUserID(updatedPayment.getUserID());
            payment.setEventID(updatedPayment.getEventID());
            payment.setAmount(updatedPayment.getAmount());
            payment.setPaymentDate(updatedPayment.getPaymentDate());
            payment.setPaymentMethod(updatedPayment.getPaymentMethod());
            payment.setPaymentStatus(updatedPayment.getPaymentStatus());
            payment.setTransactionReference(updatedPayment.getTransactionReference());
            return paymentRepository.save(payment);
        }).orElseThrow(() -> new RuntimeException("Payment not found with ID " + id));
    }

    public void deletePayment(Long id) {
        paymentRepository.deleteById(Objects.requireNonNull(id, PAYMENT_ID_REQUIRED));
    }
}
