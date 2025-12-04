package org.qrush.ticketing_system.dto;

public class CancelEventResponse {
    private boolean success;
    private String message;
    private int ticketsRefunded;
    private double totalRefundAmount;

    public CancelEventResponse() {
    }

    public CancelEventResponse(boolean success, String message, int ticketsRefunded, double totalRefundAmount) {
        this.success = success;
        this.message = message;
        this.ticketsRefunded = ticketsRefunded;
        this.totalRefundAmount = totalRefundAmount;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public int getTicketsRefunded() {
        return ticketsRefunded;
    }

    public void setTicketsRefunded(int ticketsRefunded) {
        this.ticketsRefunded = ticketsRefunded;
    }

    public double getTotalRefundAmount() {
        return totalRefundAmount;
    }

    public void setTotalRefundAmount(double totalRefundAmount) {
        this.totalRefundAmount = totalRefundAmount;
    }
}
