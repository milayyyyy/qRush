package org.qrush.ticketing_system.service;

import org.qrush.ticketing_system.entity.PaymentEntity;
import org.qrush.ticketing_system.repository.PaymentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;

    public PaymentService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    public List<PaymentEntity> getAllPayments() {
        return paymentRepository.findAll();
    }

    public Optional<PaymentEntity> getPaymentById(Long id) {
        return paymentRepository.findById(id);
    }

    public List<PaymentEntity> getPaymentsByUser(Long userID) {
        return paymentRepository.findByUserID(userID);
    }

    public List<PaymentEntity> getPaymentsByEvent(Long eventID) {
        return paymentRepository.findByEventID(eventID);
    }

    public PaymentEntity getPaymentByTransactionReference(String reference) {
        return paymentRepository.findByTransactionReference(reference);
    }

    public PaymentEntity createPayment(PaymentEntity payment) {
        return paymentRepository.save(payment);
    }

    public PaymentEntity updatePayment(Long id, PaymentEntity updatedPayment) {
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
        paymentRepository.deleteById(id);
    }
}
