package ro.okcurier.platform.locker;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import ro.okcurier.platform.enums.CourierCompanyEnum;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LockerService {
    private final LockerRepository lockerRepository;
    
    public List<LockerDTO> getLockersByCourier(String courierName) {
        try {
            CourierCompanyEnum courier = CourierCompanyEnum.valueOf(courierName.toUpperCase());
            return lockerRepository.findByCourier(courier)
                    .stream()
                    .map(LockerDTO::fromEntity)
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            log.error("Invalid courier name: {}", courierName, e);
            return List.of();
        }
    }
    
    public Optional<LockerDTO> getLockerById(String lockerId) {
        return lockerRepository.findByLockerId(lockerId)
                .map(LockerDTO::fromEntity);
    }
}
