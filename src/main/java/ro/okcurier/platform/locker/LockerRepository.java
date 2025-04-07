package ro.okcurier.platform.locker;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ro.okcurier.platform.enums.CourierCompanyEnum;

import java.util.List;
import java.util.Optional;

@Repository
public interface LockerRepository extends JpaRepository<Locker, Long> {
    List<Locker> findByCourier(CourierCompanyEnum courier);
    Optional<Locker> findByLockerId(String lockerId);
}
