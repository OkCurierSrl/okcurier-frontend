package ro.okcurier.platform.locker;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/lockers")
@RequiredArgsConstructor
@CrossOrigin
@Slf4j
public class LockerController {
    private final LockerService lockerService;
    
    @GetMapping("/{courier}")
    @Operation(summary = "Get lockers by courier", description = "Retrieves all lockers for a specific courier company")
    @ApiResponse(responseCode = "200", description = "Lockers retrieved successfully", 
                content = @Content(schema = @Schema(implementation = LockerDTO.class)))
    public ResponseEntity<List<LockerDTO>> getLockersByCourier(@PathVariable String courier) {
        log.info("Retrieving lockers for courier: {}", courier);
        List<LockerDTO> lockers = lockerService.getLockersByCourier(courier);
        return ResponseEntity.ok(lockers);
    }
    
    @GetMapping("/locker/{lockerId}")
    @Operation(summary = "Get locker by ID", description = "Retrieves a specific locker by its ID")
    @ApiResponse(responseCode = "200", description = "Locker retrieved successfully", 
                content = @Content(schema = @Schema(implementation = LockerDTO.class)))
    @ApiResponse(responseCode = "404", description = "Locker not found")
    public ResponseEntity<LockerDTO> getLockerById(@PathVariable String lockerId) {
        log.info("Retrieving locker with ID: {}", lockerId);
        return lockerService.getLockerById(lockerId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
