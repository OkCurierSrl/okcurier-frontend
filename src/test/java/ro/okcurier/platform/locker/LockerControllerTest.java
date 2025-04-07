package ro.okcurier.platform.locker;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LockerControllerTest {

    @Mock
    private LockerService lockerService;

    @InjectMocks
    private LockerController lockerController;

    private LockerDTO dpdLockerDTO;
    private LockerDTO cargusLockerDTO;

    @BeforeEach
    void setUp() {
        LockerDTO.Coordinates dpdCoordinates = new LockerDTO.Coordinates(44.4377401, 26.0946235);
        dpdLockerDTO = new LockerDTO("DPD-001", "DPD Locker Test", "Test Address 1", "DPD", dpdCoordinates);

        LockerDTO.Coordinates cargusCoordinates = new LockerDTO.Coordinates(44.4797401, 26.1146235);
        cargusLockerDTO = new LockerDTO("CARGUS-001", "Cargus Locker Test", "Test Address 2", "CARGUS", cargusCoordinates);
    }

    @Test
    void getLockersByCourier_shouldReturnLockers_whenServiceReturnsLockers() {
        // Arrange
        when(lockerService.getLockersByCourier("DPD")).thenReturn(List.of(dpdLockerDTO));

        // Act
        ResponseEntity<List<LockerDTO>> response = lockerController.getLockersByCourier("DPD");

        // Assert
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody()).hasSize(1);
        assertThat(response.getBody().get(0).getId()).isEqualTo("DPD-001");
    }

    @Test
    void getLockersByCourier_shouldReturnEmptyList_whenServiceReturnsEmptyList() {
        // Arrange
        when(lockerService.getLockersByCourier("UNKNOWN")).thenReturn(List.of());

        // Act
        ResponseEntity<List<LockerDTO>> response = lockerController.getLockersByCourier("UNKNOWN");

        // Assert
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody()).isEmpty();
    }

    @Test
    void getLockerById_shouldReturnLocker_whenServiceReturnsLocker() {
        // Arrange
        when(lockerService.getLockerById("DPD-001")).thenReturn(Optional.of(dpdLockerDTO));

        // Act
        ResponseEntity<LockerDTO> response = lockerController.getLockerById("DPD-001");

        // Assert
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getId()).isEqualTo("DPD-001");
        assertThat(response.getBody().getName()).isEqualTo("DPD Locker Test");
    }

    @Test
    void getLockerById_shouldReturnNotFound_whenServiceReturnsEmpty() {
        // Arrange
        when(lockerService.getLockerById("NONEXISTENT")).thenReturn(Optional.empty());

        // Act
        ResponseEntity<LockerDTO> response = lockerController.getLockerById("NONEXISTENT");

        // Assert
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isNull();
    }
}
