package com.privatesearch.browserbackend.controller;

import com.privatesearch.browserbackend.model.SearchHistory;
import com.privatesearch.browserbackend.model.User;
import com.privatesearch.browserbackend.repository.SearchHistoryRepository;
import com.privatesearch.browserbackend.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;

@RestController
public class SearchController {

    private final RestClient restClient = RestClient.create();
    private final SearchHistoryRepository searchHistoryRepository;
    private final UserRepository userRepository;

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

        searchHistoryRepository.save(
                new SearchHistory(q, user)
        );

        String url = "http://localhost:8080/search?q=" +
                q +
                "&categories=" +
                category +
                "&pageno=" +
                page +
                "&format=json";

        return restClient.get()
                .uri(url)
                .retrieve()
                .body(String.class);
    }
}