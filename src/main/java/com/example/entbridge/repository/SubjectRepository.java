package com.example.entbridge.repository;

import com.example.entbridge.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface SubjectRepository extends JpaRepository<Subject, Long> {
    Optional<Subject> findByCode(String code);

    List<Subject> findByNameContainingIgnoreCase(String name);
}
