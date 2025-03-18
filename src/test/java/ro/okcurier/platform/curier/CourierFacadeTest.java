@ExtendWith(MockitoExtension.class)
class CourierFacadeTest {

    @Mock
    private CargusService cargusService;
    @Mock
    private DpdService dpdService;
    @Mock
    private GlsService glsService;
    @Mock
    private SamedayService samedayService;

    @InjectMocks
    private CourierFacade courierFacade;

    @Test
    void calculateRecheckWeight_ShouldDelegateToCorrectService() {
        // Arrange
        String awb = "TEST123";
        double expectedWeight = 2.5;

        when(cargusService.getShipmentCalculationWeight(awb)).thenReturn(expectedWeight);
        when(dpdService.getShipmentCalculationWeight(awb)).thenReturn(expectedWeight);
        when(glsService.getShipmentCalculationWeight(awb)).thenReturn(expectedWeight);
        when(samedayService.getShipmentCalculationWeight(awb)).thenReturn(expectedWeight);

        // Act & Assert
        for (CourierCompanyEnum courier : CourierCompanyEnum.values()) {
            Double result = courierFacade.calculateRecheckWeight(awb, courier);
            
            assertThat(result).isEqualTo(expectedWeight);

            switch (courier) {
                case CARGUS -> verify(cargusService).getShipmentCalculationWeight(awb);
                case DPD -> verify(dpdService).getShipmentCalculationWeight(awb);
                case GLS -> verify(glsService).getShipmentCalculationWeight(awb);
                case SAMEDAY -> verify(samedayService).getShipmentCalculationWeight(awb);
            }
        }
    }

    @Test
    void calculateRecheckWeight_ShouldReturnNullWhenServiceReturnsNull() {
        // Arrange
        String awb = "TEST123";
        when(cargusService.getShipmentCalculationWeight(awb)).thenReturn(null);

        // Act
        Double result = courierFacade.calculateRecheckWeight(awb, CourierCompanyEnum.CARGUS);

        // Assert
        assertThat(result).isNull();
        verify(cargusService).getShipmentCalculationWeight(awb);
    }
}