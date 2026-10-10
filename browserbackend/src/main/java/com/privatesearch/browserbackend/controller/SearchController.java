package com.privatesearch.browserbackend.controller;

import com.privatesearch.browserbackend.model.SearchHistory;
import com.privatesearch.browserbackend.model.User;
import com.privatesearch.browserbackend.repository.SearchHistoryRepository;
import com.privatesearch.browserbackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
public class SearchController {

    private final RestClient restClient = RestClient.create();
    private final SearchHistoryRepository searchHistoryRepository;
    private final UserRepository userRepository;

    @Value("${SEARXNG_URL:http://localhost:8080}")
    private String searxngUrl;

    public SearchController(
            SearchHistoryRepository searchHistoryRepository,
            UserRepository userRepository
    ) {
        this.searchHistoryRepository = searchHistoryRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/search")
    public String search(
            @RequestParam String q,
            @RequestParam(defaultValue = "general") String category,
            @RequestParam(defaultValue = "1") int page,
            Authentication authentication
    ) {
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        searchHistoryRepository.save(new SearchHistory(q, user));

        String url = UriComponentsBuilder
                .fromUriString(searxngUrl)
                .path("/search")
                .queryParam("q", q)
                .queryParam("categories", category)
                .queryParam("pageno", page)
                .queryParam("format", "json")
                .build()
                .encode()
                .toUriString();

        return restClient.get()
                .uri(url)
                .retrieve()
                .body(String.class);
    }
}