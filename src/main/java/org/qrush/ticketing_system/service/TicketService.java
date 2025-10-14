package org.qrush.ticketing_system.service;

import org.qrush.ticketing_system.entity.TicketEntity;
import org.qrush.ticketing_system.repository.TicketRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;

    public TicketService(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    public List<TicketEntity> getAllTickets() {
        return ticketRepository.findAll();
    }

    public Optional<TicketEntity> getTicketById(Long id) {
        return ticketRepository.findById(id);
    }

    public TicketEntity createTicket(TicketEntity ticket) {
        return ticketRepository.save(ticket);
    }

    public TicketEntity updateTicket(Long id, TicketEntity updatedTicket) {
        return ticketRepository.findById(id).map(ticket -> {
            ticket.setUser(updatedTicket.getUser());
            ticket.setEvent(updatedTicket.getEvent());
            ticket.setQrCode(updatedTicket.getQrCode());
            ticket.setPrice(updatedTicket.getPrice());
            ticket.setPurchase_date(updatedTicket.getPurchase_date());
            ticket.setTicket_type(updatedTicket.getTicket_type());
            ticket.setStatus(updatedTicket.getStatus());
            return ticketRepository.save(ticket);
        }).orElseThrow(() -> new RuntimeException("Ticket not found with ID: " + id));
    }

    public void deleteTicket(Long id) {
        ticketRepository.deleteById(id);
    }
}
