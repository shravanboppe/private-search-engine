package com.privatesearch.browserbackend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "FIRECRAWL_API_KEY=test-key",
        "JWT_SECRET=test-only-secret-key-that-is-at-least-32-characters"
})
class BrowserbackendApplicationTests {

    @Test
    void contextLoads() {
    }
}