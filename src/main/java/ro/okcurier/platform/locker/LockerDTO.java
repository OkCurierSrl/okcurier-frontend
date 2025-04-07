package ro.okcurier.platform.locker;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LockerDTO {
    private String id;
    private String name;
    private String address;
    private String courier;
    private Coordinates coordinates;
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Coordinates {
        private Double lat;
        private Double lng;
    }
    
    public static LockerDTO fromEntity(Locker locker) {
        LockerDTO dto = new LockerDTO();
        dto.setId(locker.getLockerId());
        dto.setName(locker.getName());
        dto.setAddress(locker.getAddress());
        dto.setCourier(locker.getCourier().name());
        
        Coordinates coordinates = new Coordinates();
        coordinates.setLat(locker.getLatitude());
        coordinates.setLng(locker.getLongitude());
        dto.setCoordinates(coordinates);
        
        return dto;
    }
}
