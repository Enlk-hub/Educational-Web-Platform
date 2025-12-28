package com.example.entbridge.repository;

import com.example.entbridge.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailIgnoreCase(String email);
    Optional<User> findByUsernameIgnoreCase(String username);
    Optional<User> findByEmailIgnoreCaseOrUsernameIgnoreCase(String email, String username);
}
