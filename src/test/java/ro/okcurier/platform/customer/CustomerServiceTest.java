package ro.okcurier.platform.customer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import org.json.JSONObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ro.okcurier.platform.calculator.BillingInfo;
import ro.okcurier.platform.calculator.BillingInfoRepository;
import ro.okcurier.platform.calculator.Discount;
import ro.okcurier.platform.email.Email;
import ro.okcurier.platform.email.EmailService;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {

    @Mock
    private BillingInfoRepository billingInfoRepository;
    @Mock
    private EmailService emailService;
    @Mock
    private Auth0Service auth0Service;

    private CustomerService customerService;
    private ObjectMapper objectMapper;
    private static final String TEST_EMAIL = "test@example.com";
    private static final String REGISTRATION_LINK = "http://example.com/register";

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        customerService = new CustomerService(billingInfoRepository, emailService, auth0Service, REGISTRATION_LINK);
    }

    @Test
    void inviteClient_ShouldSendEmailAndSaveBillingInfo() {
        String contractNumber = "CONTRACT123";
        
        customerService.inviteClient(TEST_EMAIL, contractNumber);

        ArgumentCaptor<Email> emailCaptor = ArgumentCaptor.forClass(Email.class);
        verify(emailService).sendCustomEmail(emailCaptor.capture());
        Email sentEmail = emailCaptor.getValue();
        
        assertEquals(TEST_EMAIL, sentEmail.to());
        assertTrue(sentEmail.body().contains(contractNumber));
        assertTrue(sentEmail.body().contains(REGISTRATION_LINK));
        
        verify(billingInfoRepository).save(any(BillingInfo.class));
    }

    @Test
    void modifyBillingInfo_WithExistingBillingInfo_ShouldUpdateId() {
        BillingInfo existingBillingInfo = new BillingInfo();
        existingBillingInfo.setId(1L);
        when(billingInfoRepository.findByEmailIgnoreCase(TEST_EMAIL)).thenReturn(existingBillingInfo);

        BillingInfo newBillingInfo = new BillingInfo();
        customerService.modifyBillingInfo(TEST_EMAIL, newBillingInfo);

        assertEquals(1L, newBillingInfo.getId());
        verify(billingInfoRepository).save(newBillingInfo);
    }

    @Test
    void modifyDiscounts_ShouldUpdateAndSave() {
        BillingInfo billingInfo = new BillingInfo();
        Discount discount = new Discount();
        when(billingInfoRepository.findByEmailIgnoreCase(TEST_EMAIL)).thenReturn(billingInfo);

        customerService.modifyDiscounts(TEST_EMAIL, discount);

        verify(billingInfoRepository).save(billingInfo);
    }

    @Test
    void isCompletedProfile_WithValidPersonalInfo_ShouldReturnTrue() {
        BillingInfo billingInfo = new BillingInfo();
        billingInfo.setIban("RO49AAAA1B31007593840000");
        billingInfo.setIbanName("John Doe");
        billingInfo.setCnp("1234567890123");
        
        when(billingInfoRepository.findByEmailIgnoreCase(TEST_EMAIL)).thenReturn(billingInfo);

        assertTrue(customerService.isCompletedProfile(TEST_EMAIL));
    }

    @Test
    void isCompletedProfile_WithValidCompanyInfo_ShouldReturnTrue() {
        BillingInfo billingInfo = new BillingInfo();
        billingInfo.setIban("RO49AAAA1B31007593840000");
        billingInfo.setIbanName("Company SRL");
        billingInfo.setCui("RO12345678");
        billingInfo.setCompanyName("Company SRL");
        billingInfo.setRegistrationNumber("J40/123/2023");
        
        when(billingInfoRepository.findByEmailIgnoreCase(TEST_EMAIL)).thenReturn(billingInfo);

        assertTrue(customerService.isCompletedProfile(TEST_EMAIL));
    }

    @Test
    void hasContract_WithValidContract_ShouldReturnTrue() {
        BillingInfo billingInfo = new BillingInfo();
        billingInfo.setContractNumber("CONTRACT123");
        when(billingInfoRepository.findByEmailIgnoreCase(TEST_EMAIL)).thenReturn(billingInfo);

        assertTrue(customerService.hasContract(TEST_EMAIL));
    }

    @Test
    void getClientByEmail_ShouldReturnCustomer() throws Exception {
        ArrayNode userArray = objectMapper.createArrayNode();
        JsonNode userNode = createMockUserNode();
        userArray.add(userNode);
        
        when(auth0Service.getUserByEmail(TEST_EMAIL)).thenReturn(userArray);
        when(billingInfoRepository.findByEmailIgnoreCase(TEST_EMAIL)).thenReturn(new BillingInfo());

        Customer result = customerService.getClientByEmail(TEST_EMAIL);

        assertNotNull(result);
        assertEquals(TEST_EMAIL, result.getEmail());
    }

    @Test
    void getAllClients_ShouldReturnListOfCustomers() throws Exception {
        ArrayNode usersArray = objectMapper.createArrayNode();
        usersArray.add(createMockUserNode());
        
        when(auth0Service.getAllUsers()).thenReturn(usersArray);
        when(billingInfoRepository.findByEmailIgnoreCase(any())).thenReturn(new BillingInfo());

        List<Customer> results = customerService.getAllClients();

        assertFalse(results.isEmpty());
        assertEquals(1, results.size());
    }

    @Test
    void blockClient_ShouldCallAuth0Service() throws Exception {
        Customer mockCustomer = new Customer();
        mockCustomer.setUserId("auth0|123");
        when(auth0Service.getUserByEmail(TEST_EMAIL)).thenReturn(createMockUserArrayNode(mockCustomer));

        customerService.blockClient(TEST_EMAIL, true);

        verify(auth0Service).updateClient(eq(mockCustomer.getUserId()), any(JSONObject.class));
    }

    @Test
    void deleteClient_ShouldCallAuth0Service() throws Exception {
        Customer mockCustomer = new Customer();
        mockCustomer.setUserId("auth0|123");
        when(auth0Service.getUserByEmail(TEST_EMAIL)).thenReturn(createMockUserArrayNode(mockCustomer));

        customerService.deleteClient(TEST_EMAIL);

        verify(auth0Service).deleteClient(mockCustomer.getUserId());
    }

    private JsonNode createMockUserNode() {
        return objectMapper.createObjectNode()
                .put("email", TEST_EMAIL)
                .put("family_name", "Doe")
                .put("nickname", "johndoe")
                .put("picture", "http://example.com/picture.jpg")
                .put("updated_at", "2023-01-01")
                .put("user_id", "auth0|123")
                .put("name", "John Doe")
                .put("created_at", "2023-01-01")
                .put("email_verified", true)
                .put("given_name", "John")
                .put("last_login", "2023-01-01")
                .put("blocked", false)
                .put("last_ip", "127.0.0.1")
                .put("logins_count", 1);
    }

    private ArrayNode createMockUserArrayNode(Customer customer) {
        ArrayNode arrayNode = objectMapper.createArrayNode();
        arrayNode.add(objectMapper.createObjectNode()
                .put("user_id", customer.getUserId()));
        return arrayNode;
    }
}