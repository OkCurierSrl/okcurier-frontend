package ro.okcurier.platform.locker;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import ro.okcurier.platform.enums.CourierCompanyEnum;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
@Profile("!test") // Don't run in test profile
public class LockerDataLoader {
    private final LockerRepository lockerRepository;
    
    @PostConstruct
    public void loadSampleData() {
        if (lockerRepository.count() == 0) {
            log.info("Loading sample locker data");
            
            // Sample DPD lockers
            Locker dpd1 = new Locker();
            dpd1.setLockerId("DPD-001");
            dpd1.setName("DPD Locker Bucharest Center");
            dpd1.setAddress("Calea Victoriei 25, Bucharest");
            dpd1.setCourier(CourierCompanyEnum.DPD);
            dpd1.setLatitude(44.4377401);
            dpd1.setLongitude(26.0946235);
            
            Locker dpd2 = new Locker();
            dpd2.setLockerId("DPD-002");
            dpd2.setName("DPD Locker Mall Vitan");
            dpd2.setAddress("Calea Vitan 55-59, Bucharest");
            dpd2.setCourier(CourierCompanyEnum.DPD);
            dpd2.setLatitude(44.4197401);
            dpd2.setLongitude(26.1246235);
            
            // Sample CARGUS lockers
            Locker cargus1 = new Locker();
            cargus1.setLockerId("CARGUS-001");
            cargus1.setName("Cargus Locker Pipera");
            cargus1.setAddress("Bd. Dimitrie Pompeiu 6A, Bucharest");
            cargus1.setCourier(CourierCompanyEnum.CARGUS);
            cargus1.setLatitude(44.4797401);
            cargus1.setLongitude(26.1146235);
            
            Locker cargus2 = new Locker();
            cargus2.setLockerId("CARGUS-002");
            cargus2.setName("Cargus Locker Militari");
            cargus2.setAddress("Bd. Iuliu Maniu 546-560, Bucharest");
            cargus2.setCourier(CourierCompanyEnum.CARGUS);
            cargus2.setLatitude(44.4297401);
            cargus2.setLongitude(26.0046235);
            
            // Sample SAMEDAY lockers
            Locker sameday1 = new Locker();
            sameday1.setLockerId("SAMEDAY-001");
            sameday1.setName("Sameday Locker Unirii");
            sameday1.setAddress("Piața Unirii 1, Bucharest");
            sameday1.setCourier(CourierCompanyEnum.SAMEDAY);
            sameday1.setLatitude(44.4277401);
            sameday1.setLongitude(26.1046235);
            
            // Sample GLS lockers
            Locker gls1 = new Locker();
            gls1.setLockerId("GLS-001");
            gls1.setName("GLS Locker Baneasa");
            gls1.setAddress("Șoseaua București-Ploiești 42D, Bucharest");
            gls1.setCourier(CourierCompanyEnum.GLS);
            gls1.setLatitude(44.5077401);
            gls1.setLongitude(26.0746235);
            
            lockerRepository.saveAll(List.of(dpd1, dpd2, cargus1, cargus2, sameday1, gls1));
            log.info("Sample locker data loaded successfully");
        }
    }
}
