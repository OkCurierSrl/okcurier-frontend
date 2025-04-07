package ro.okcurier.platform.locker;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ro.okcurier.platform.enums.CourierCompanyEnum;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "lockers")
public class Locker {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String lockerId;
    private String name;
    private String address;
    
    @Enumerated(EnumType.STRING)
    private CourierCompanyEnum courier;
    
    private Double latitude;
    private Double longitude;
}
