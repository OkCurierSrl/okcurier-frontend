package ro.okcurier.platform.email;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class EmailTemplates {
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss");
    
    public static String weightRecheckTemplate(String awb, LocalDateTime date, 
            double declaredWeight, double actualWeight, 
            double originalPrice, double newPrice) {
        return String.format("""
            <div style='font-family: Arial, sans-serif;'>
                <h1>📦 Actualizare preț expediere</h1>
                <div>AWB: %s</div>
                <div>Data: %s</div>

                <p>Detalii modificare:</p>
                <ul>
                    <li>Greutate declarată: %.2f kg</li>
                    <li>Greutate constatată: %.2f kg</li>
                    <li>Preț inițial: %.2f RON</li>
                    <li>Preț actualizat: %.2f RON</li>
                    <li>Diferență de achitat: %.2f RON</li>
                </ul>

                <p>Diferența de preț va fi facturată separat și adăugată la următoarea factură.</p>
                
                <p>Cu stimă,<br/>Echipa OkCurier</p>
            </div>
            """,
            awb,
            date.format(DATE_FORMATTER),
            declaredWeight,
            actualWeight,
            originalPrice,
            newPrice,
            newPrice - originalPrice
        );
    }

    public static String anafReportTemplate(int year, int month) {
        return String.format("Please find the attached XML report for %02d/%d.", month, year);
    }

    public static String rambursReportTemplate(String clientName, double totalSum) {
        return String.format("""
            Buna ziua %s,

            Atașat găsiți raportul de rambursuri cu suma totală de %.2f RON.

            Cu stimă,
            Echipa OkCurier
            """, 
            clientName, totalSum);
    }
}