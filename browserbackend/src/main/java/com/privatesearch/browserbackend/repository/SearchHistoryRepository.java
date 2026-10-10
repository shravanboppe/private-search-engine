
package com.privatesearch.browserbackend.repository;

import com.privatesearch.browserbackend.model.SearchHistory;
import com.privatesearch.browserbackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SearchHistoryRepository extends JpaRepository<SearchHistory, Long> {

    List<SearchHistory> findByUser(User user);

    void deleteByUser(User user);

    void deleteByIdAndUser(Long id, User user);
}