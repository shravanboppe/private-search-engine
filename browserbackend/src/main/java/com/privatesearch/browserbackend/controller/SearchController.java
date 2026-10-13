package com.privatesearch.browserbackend.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;

import com.privatesearch.browserbackend.model.SearchHistory;
import com.privatesearch.browserbackend.model.User;
import com.privatesearch.browserbackend.repository.SearchHistoryRepository;
import com.privatesearch.browserbackend.repository.UserRepository;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ArrayNode;
import tools.jackson.databind.node.ObjectNode;

@RestController
public class SearchController {

    private final RestClient restClient = RestClient.create();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final SearchHistoryRepository searchHistoryRepository;
    private final UserRepository userRepository;

    @Value("${FIRECRAWL_API_KEY}")
    private String firecrawlApiKey;

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
    ) throws Exception {
        if (page < 1) {
            throw new IllegalArgumentException("Page must be at least 1");
        }

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        searchHistoryRepository.save(new SearchHistory(q, user));

        JsonNode response = restClient.post()
                .uri("https://api.firecrawl.dev/v2/search")
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer " + firecrawlApiKey)
                .body(Map.of(
                        "query", q,
                        "limit", 20,
                        "sources", new String[]{"web"}
                ))
                .retrieve()
                .body(JsonNode.class);

        JsonNode webResults = response.path("data").path("web");
        int pageSize = 10;
        int start = (page - 1) * pageSize;

        ArrayNode pageResults = objectMapper.createArrayNode();

        if (webResults.isArray()) {
            for (int i = start; i < Math.min(start + pageSize, webResults.size()); i++) {
                pageResults.add(webResults.get(i));
            }
        }

        ObjectNode result = objectMapper.createObjectNode();
        result.put("query", q);
        result.put("page", page);
        result.put("pageSize", pageSize);
        result.put("totalResults", webResults.isArray() ? webResults.size() : 0);
        result.set("results", pageResults);

        return objectMapper.writeValueAsString(result);
    }
}