package ro.okcurier.platform.locker;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ro.okcurier.platform.enums.CourierCompanyEnum;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LockerServiceTest {

    @Mock
    private LockerRepository lockerRepository;

    @InjectMocks
    private LockerService lockerService;

    private Locker dpdLocker;
    private Locker cargusLocker;

    @BeforeEach
    void setUp() {
        dpdLocker = new Locker();
        dpdLocker.setId(1L);
        dpdLocker.setLockerId("DPD-001");
        dpdLocker.setName("DPD Locker Test");
        dpdLocker.setAddress("Test Address 1");
        dpdLocker.setCourier(CourierCompanyEnum.DPD);
        dpdLocker.setLatitude(44.4377401);
        dpdLocker.setLongitude(26.0946235);

        cargusLocker = new Locker();
        cargusLocker.setId(2L);
        cargusLocker.setLockerId("CARGUS-001");
        cargusLocker.setName("Cargus Locker Test");
        cargusLocker.setAddress("Test Address 2");
        cargusLocker.setCourier(CourierCompanyEnum.CARGUS);
        cargusLocker.setLatitude(44.4797401);
        cargusLocker.setLongitude(26.1146235);
    }

    @Test
    void getLockersByCourier_shouldReturnLockers_whenValidCourier() {
        // Arrange
        when(lockerRepository.findByCourier(CourierCompanyEnum.DPD)).thenReturn(List.of(dpdLocker));

        // Act
        List<LockerDTO> result = lockerService.getLockersByCourier("DPD");

        // Assert
        assertThat(result).isNotEmpty();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo("DPD-001");
        assertThat(result.get(0).getName()).isEqualTo("DPD Locker Test");
        assertThat(result.get(0).getCourier()).isEqualTo("DPD");
        assertThat(result.get(0).getCoordinates().getLat()).isEqualTo(44.4377401);
    }

    @Test
    void getLockersByCourier_shouldReturnEmptyList_whenInvalidCourier() {
        // Act
        List<LockerDTO> result = lockerService.getLockersByCourier("INVALID_COURIER");

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    void getLockerById_shouldReturnLocker_whenLockerExists() {
        // Arrange
        when(lockerRepository.findByLockerId("DPD-001")).thenReturn(Optional.of(dpdLocker));

        // Act
        Optional<LockerDTO> result = lockerService.getLockerById("DPD-001");

        // Assert
        assertThat(result).isPresent();
        assertThat(result.get().getId()).isEqualTo("DPD-001");
        assertThat(result.get().getName()).isEqualTo("DPD Locker Test");
    }

    @Test
    void getLockerById_shouldReturnEmpty_whenLockerDoesNotExist() {
        // Arrange
        when(lockerRepository.findByLockerId("NONEXISTENT")).thenReturn(Optional.empty());

        // Act
        Optional<LockerDTO> result = lockerService.getLockerById("NONEXISTENT");

        // Assert
        assertThat(result).isEmpty();
    }
}
