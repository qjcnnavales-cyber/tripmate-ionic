import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Booking } from './bookings.service';

@Injectable({ providedIn: 'root' })
export class PdfService {
  
  generateSingleReservationPdf(booking: Booking) {
    const doc = new jsPDF();

    const coralRgb: [number, number, number] = [255, 107, 74];
    const greenRgb: [number, number, number] = [15, 46, 37];

    doc.setTextColor(coralRgb[0], coralRgb[1], coralRgb[2]);
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text("TripMate", 20, 20);
    
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Booking Receipt", 20, 26);
    
    doc.setTextColor(greenRgb[0], greenRgb[1], greenRgb[2]);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Booking #${booking.id}`, 20, 45);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Status: ${booking.status.toUpperCase()}`, 20, 52);

    doc.setDrawColor(200, 200, 200);
    doc.line(20, 58, 190, 58);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(booking.property?.name || 'Property Name', 20, 70);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Location: ${booking.property?.location || 'Location missing'}`, 20, 77);

    autoTable(doc, {
      startY: 85,
      head: [['Check-in Date', 'Check-out Date', 'Guests']],
      body: [
        [
          this.formatDate(booking.check_in), 
          this.formatDate(booking.check_out), 
          `${booking.num_guests || 1} Guest(s)`
        ]
      ],
      headStyles: { fillColor: coralRgb, textColor: [255,255,255] },
      bodyStyles: { textColor: greenRgb }
    });

    const finalY = (doc as any).lastAutoTable.finalY || 110;
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(coralRgb[0], coralRgb[1], coralRgb[2]);
    doc.text(`Total Price: PHP ${booking.total_price?.toLocaleString('en-PH') || 0}`, 20, finalY + 15);

    doc.setTextColor(100, 100, 100);
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text("Thank you for booking with TripMate!", 20, finalY + 40);
    
    const today = new Date().toLocaleDateString('en-PH');
    doc.text(`Generated on: ${today}`, 20, finalY + 46);

    doc.save(`TripMate_Reservation_${booking.id}.pdf`);
  }

  generateAllReservationsPdf(bookings: Booking[]) {
    const doc = new jsPDF();
    const coralRgb: [number, number, number] = [255, 107, 74];
    const greenRgb: [number, number, number] = [15, 46, 37];

    doc.setTextColor(coralRgb[0], coralRgb[1], coralRgb[2]);
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text("TripMate", 20, 20);
    
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("All Reservations Report", 20, 28);

    const totalReservations = bookings.length;
    const totalSpent = bookings
      .filter(b => b.status === 'completed' || b.status === 'confirmed')
      .reduce((sum, b) => sum + (b.total_price || 0), 0);
    
    const upcomingCount = bookings.filter(b => {
      const checkout = new Date(b.check_out);
      return b.status !== 'cancelled' && checkout >= new Date();
    }).length;

    doc.setTextColor(greenRgb[0], greenRgb[1], greenRgb[2]);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Total Reservations: ${totalReservations}`, 20, 45);
    doc.text(`Total Spent (Confirmed/Completed): PHP ${totalSpent.toLocaleString('en-PH')}`, 20, 52);
    doc.text(`Upcoming Reservations: ${upcomingCount}`, 20, 59);

    const tableData = bookings.map(b => [
      b.id.substring(0, 8),
      b.property?.name || 'Property',
      this.formatDate(b.check_in),
      this.formatDate(b.check_out),
      `PHP ${b.total_price?.toLocaleString('en-PH') || 0}`,
      b.status.toUpperCase()
    ]);

    autoTable(doc, {
      startY: 68,
      head: [['Booking ID', 'Property', 'Check-In', 'Check-Out', 'Total Price', 'Status']],
      body: tableData,
      headStyles: { fillColor: coralRgb, textColor: [255,255,255] },
      bodyStyles: { textColor: greenRgb },
      styles: { fontSize: 9 }
    });

    doc.save('TripMate_All_Reservations.pdf');
  }

  private formatDate(dateStr: string) {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
  }
}
