package com.example.entbridge.repository;

import com.example.entbridge.entity.TestResult;
import com.example.entbridge.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TestResultRepository extends JpaRepository<TestResult, Long> {
    @EntityGraph(attributePaths = {"subject", "user"})
    Page<TestResult> findByUser(User user, Pageable pageable);
    @EntityGraph(attributePaths = {"subject", "user"})
    List<TestResult> findByUser(User user);
    @EntityGraph(attributePaths = {"subject", "user"})
    List<TestResult> findAllByOrderByCompletedAtDesc();
}
