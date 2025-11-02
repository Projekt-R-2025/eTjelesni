package com.etjelesni.backend.config;

import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.OpenAPI;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI apiInfo() {
        return new OpenAPI()
                .info(new Info()
                        .title("eTjelesni API dokumentacija")
                        .description("""
                                eTjelesni — backend aplikacija razvijena za kolegij Projekt R na FER‑u u akademskoj godini 2025/2026.<br/>
                                Ovaj REST API omogućava upravljanje korisnicima, autentikaciju i autorizaciju te rad s podacima.<br/>
                                Dokumentacija sadrži opis dostupnih endpointa, modela podataka i primjere zahtjeva i odgovora.<br/>
                                """)
                        .version("1.0"));
    }
}
