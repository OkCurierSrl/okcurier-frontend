package ro.okcurier.platform.curier.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import ro.okcurier.platform.curier.auth.Token;

@Configuration
public class TokenConfig {
    
    @Bean("cargusToken")
    public Token cargusToken() {
        return new Token();
    }

    @Bean("samedayToken")
    public Token samedayToken() {
        return new Token();
    }

    @Bean("dpdToken")
    public Token dpdToken() {
        return new Token();
    }
}