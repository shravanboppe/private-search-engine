package com.privatesearch.browserbackend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

import java.time.LocalDateTime;

@Entity
public class SearchHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String query;

    private LocalDateTime searchedAt;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public SearchHistory() {
    }

    public SearchHistory(String query, User user) {
        this.query = query;
        this.user = user;
        this.searchedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getQuery() {
        return query;
    }

    public LocalDateTime getSearchedAt() {
        return searchedAt;
    }

    public User getUser() {
        return user;
    }

    public void setQuery(String query) {
        this.query = query;
    }

    public void setSearchedAt(LocalDateTime searchedAt) {
        this.searchedAt = searchedAt;
    }

    public void setUser(User user) {
        this.user = user;
    }
}