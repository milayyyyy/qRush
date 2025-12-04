package org.qrush.ticketing_system.dto;

public class CancelEventRequest {
    private String reason;

    public CancelEventRequest() {
    }

    public CancelEventRequest(String reason) {
        this.reason = reason;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
