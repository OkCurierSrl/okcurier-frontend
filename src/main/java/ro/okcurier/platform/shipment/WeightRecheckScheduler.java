package ro.okcurier.platform.shipment;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import ro.okcurier.platform.curier.CourierFacade;
import ro.okcurier.platform.email.Email;
import ro.okcurier.platform.email.EmailService;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * This class is responsible for rechecking the weights of shipments on a daily basis.
 * It fetches shipments that have not had their weights rechecked yet
 * If a difference is found, it sends an email to the account owner.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class WeightRecheckScheduler {

    private static final int PAGE_SIZE = 100;
    private final ShipmentRepository shipmentRepository;
    private final CourierFacade courierFacade;
    private final EmailService emailService;

    @Scheduled(cron = "0 0 1 * * ?") // Runs at 1 AM every day
    public void recheckWeights() {
        log.info("Starting daily weight recheck job");
        int pageNumber = 0;
        int totalProcessed = 0;
        int totalWithDifference = 0;

        while (true) {
            Page<Shipment> shipmentsPage = shipmentRepository
                .findByTotalWeightRecheckedIsNullOrTotalWeightRecheckedNotEqualsTotalWeight(
                    PageRequest.of(pageNumber, PAGE_SIZE)
                );

            if (!shipmentsPage.hasContent()) {
                break;
            }

            for (Shipment shipment : shipmentsPage.getContent()) {
                try {
                    processShipment(shipment);
                    totalProcessed++;

                    if (!shipment.getTotalWeight().equals(shipment.getTotalWeightRechecked())) {
                        sendWeightDifferenceEmail(shipment);
                        totalWithDifference++;
                    }
                } catch (Exception e) {
                    log.error("Error processing shipment {}: {}", shipment.getAwb(), e.getMessage(), e);
                }
            }

            pageNumber++;
        }

        log.info("Completed daily weight recheck job. Processed: {}, With differences: {}",
            totalProcessed, totalWithDifference);
    }

    private void processShipment(Shipment shipment) {
        Double recheckWeight = courierFacade.calculateRecheckWeight(
            shipment.getAwb(),
            CourierCompanyEnum.valueOf(shipment.getCurier())
        );

        if (recheckWeight != null) {
            shipment.setTotalWeightRechecked(recheckWeight);
            shipmentRepository.save(shipment);
        }
    }

    private void sendWeightDifferenceEmail(Shipment shipment) {
        BigDecimal originalPrice = shipment.getAppPrice();
        BigDecimal newPrice = calculateNewPrice(shipment); // You'll need to implement this
        BigDecimal difference = newPrice.subtract(originalPrice);

        Email email = new Email();
        email.setTo(shipment.getEmailAccountOwner());
        email.setSubject("Actualizare preț expediere - OkCurier");
        email.setBody(String.format("""
            <div style='font-family: Arial, sans-serif;'>
                <h1 style='font-size: 24px; color: #2C3E50;'>📦 Actualizare preț expediere</h1>
                <div style='font-size: 18px; font-weight: bold;'>AWB: %s</div>
                <div style='font-size: 14px; color: #7F8C8D;'>Data: %s</div>

                <p style='font-size: 16px; margin-top: 20px;'>
                    Stimate client,
                </p>

                <p style='font-size: 16px;'>
                    În urma verificării greutății coletului de către curier, au fost constatate următoarele diferențe:
                </p>

                <div style='background-color: #F8F9FA; padding: 15px; border-radius: 5px; margin: 20px 0;'>
                    <h2 style='font-size: 18px; margin-bottom: 10px;'>Detalii modificare:</h2>
                    <div style='font-size: 16px; line-height: 1.6;'>
                        • Greutate declarată: <span style='font-weight: bold;'>%.2f kg</span><br/>
                        • Greutate constatată: <span style='font-weight: bold;'>%.2f kg</span><br/>
                        • Preț inițial: <span style='font-weight: bold;'>%.2f RON</span><br/>
                        • Preț actualizat: <span style='font-weight: bold;'>%.2f RON</span><br/>
                        • Diferență de achitat: <span style='font-weight: bold; color: #E74C3C;'>%.2f RON</span>
                    </div>
                </div>

                <p style='font-size: 16px;'>
                    Diferența de preț va fi facturată separat și adăugată la următoarea factură.
                </p>

                <div style='background-color: #F8F9FA; padding: 15px; border-radius: 5px; margin: 20px 0;'>
                    <h2 style='font-size: 18px;'>💡 Important:</h2>
                    <ul style='font-size: 14px; line-height: 1.6;'>
                        <li>Vă rugăm să declarați greutatea corectă la expediere pentru a evita costuri suplimentare</li>
                        <li>Pentru orice nelămuriri, nu ezitați să ne contactați</li>
                    </ul>
                </div>

                <div style='margin-top: 30px; border-top: 1px solid #E0E0E0; padding-top: 20px; font-size: 14px; color: #7F8C8D;'>
                    <p style='margin: 5px 0;'>Cu stimă,<br/>Echipa OkCurier</p>
                    <div style='margin-top: 15px;'>
                        <strong>OkCurier SRL</strong><br/>
                        Email: <a href='mailto:contact@okcurier.ro' style='color: #3498DB; text-decoration: none;'>contact@okcurier.ro</a><br/>
                        Tel: <a href='tel:+40731446895' style='color: #3498DB; text-decoration: none;'>+40 731 446 895</a>
                    </div>
                </div>
            </div>
            """,
            shipment.getAwb(),
            LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss")),
            shipment.getTotalWeight(),
            shipment.getTotalWeightRechecked(),
            originalPrice,
            newPrice,
            difference
        ));

        emailService.sendCustomEmail(email);
    }
}
