
package com.privatesearch.browserbackend.controller;

import com.privatesearch.browserbackend.model.SearchHistory;
import com.privatesearch.browserbackend.model.User;
import com.privatesearch.browserbackend.repository.SearchHistoryRepository;
import com.privatesearch.browserbackend.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class HistoryController {

    private final SearchHistoryRepository searchHistoryRepository;
    private final UserRepository userRepository;

    public HistoryController(
            SearchHistoryRepository searchHistoryRepository,
            UserRepository userRepository
    ) {
        this.searchHistoryRepository = searchHistoryRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/history")
    public List<SearchHistory> getHistory(Authentication authentication) {
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return searchHistoryRepository.findByUser(user);
    }

    @Transactional
    @DeleteMapping("/history")
    public void clearHistory(Authentication authentication) {
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        searchHistoryRepository.deleteByUser(user);
    }

    @Transactional
    @DeleteMapping("/history/{id}")
    public void deleteHistoryItem(
            @PathVariable Long id,
            Authentication authentication
    ) {
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        searchHistoryRepository.deleteByIdAndUser(id, user);
    }
}