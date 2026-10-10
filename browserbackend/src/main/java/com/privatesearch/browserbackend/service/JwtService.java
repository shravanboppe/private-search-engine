package com.privatesearch.browserbackend.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

private final SecretKey key;

public JwtService() {
    String secret = System.getenv("JWT_SECRET");

    if (secret == null || secret.length() < 32) {
        throw new IllegalStateException(
                "JWT_SECRET must be set and contain at least 32 characters"
        );
    }

    this.key = Keys.hmacShaKeyFor(
            secret.getBytes(StandardCharsets.UTF_8)
    );
}

public String generateToken(String email) {
    return Jwts.builder()
            .subject(email)
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + 86400000))
            .signWith(key)
            .compact();
}

public String extractEmail(String token) {
    return Jwts.parser()
            .verifyWith(key)
            .build()
            .parseSignedClaims(token)
            .getPayload()
            .getSubject();
}

}
