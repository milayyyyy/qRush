package org.qrush.ticketing_system.controller;

import org.qrush.ticketing_system.entity.PaymentEntity;
import org.qrush.ticketing_system.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping
    public ResponseEntity<List<PaymentEntity>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentEntity> getPaymentById(@PathVariable Long id) {
        return paymentService.getPaymentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userID}")
    public ResponseEntity<List<PaymentEntity>> getPaymentsByUser(@PathVariable Long userID) {
        return ResponseEntity.ok(paymentService.getPaymentsByUser(userID));
    }

    @GetMapping("/event/{eventID}")
    public ResponseEntity<List<PaymentEntity>> getPaymentsByEvent(@PathVariable Long eventID) {
        return ResponseEntity.ok(paymentService.getPaymentsByEvent(eventID));
    }

    @GetMapping("/reference/{reference}")
    public ResponseEntity<PaymentEntity> getPaymentByTransactionReference(@PathVariable String reference) {
        PaymentEntity payment = paymentService.getPaymentByTransactionReference(reference);
        if (payment == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(payment);
    }

    @PostMapping
    public ResponseEntity<PaymentEntity> createPayment(@RequestBody PaymentEntity payment) {
        return ResponseEntity.ok(paymentService.createPayment(payment));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PaymentEntity> updatePayment(@PathVariable Long id, @RequestBody PaymentEntity payment) {
        return ResponseEntity.ok(paymentService.updatePayment(id, payment));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePayment(@PathVariable Long id) {
        paymentService.deletePayment(id);
        return ResponseEntity.noContent().build();
    }
}
