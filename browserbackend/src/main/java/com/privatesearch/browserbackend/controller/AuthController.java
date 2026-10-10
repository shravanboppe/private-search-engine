
package com.privatesearch.browserbackend.controller;

import com.privatesearch.browserbackend.model.User;
import com.privatesearch.browserbackend.service.AuthService;
import com.privatesearch.browserbackend.service.JwtService;
import com.privatesearch.browserbackend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    public AuthController(
            AuthService authService,
            JwtService jwtService,
            UserRepository userRepository
    ) {
        this.authService = authService;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public UserResponse register(@RequestBody RegisterRequest request) {
        User user = authService.register(
                request.name(),
                request.email(),
                request.password()
        );

        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail()
        );
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        User user = authService.login(
                request.email(),
                request.password()
        );

        String token = jwtService.generateToken(user.getEmail());

        return new LoginResponse(token);
    }

    @GetMapping("/me")
    public UserResponse me(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()
                || authentication.getName() == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Please log in"
            );
        }

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found"
                ));

        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail()
        );
    }

    public record RegisterRequest(
            String name,
            String email,
            String password
    ) {
    }

    public record LoginRequest(
            String email,
            String password
    ) {
    }

    public record LoginResponse(
            String token
    ) {
    }

    public record UserResponse(
            Long id,
            String name,
            String email
    ) {
    }
}

