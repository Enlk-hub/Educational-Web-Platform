package com.example.entbridge.repository;

import com.example.entbridge.entity.AdminNote;
import com.example.entbridge.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AdminNoteRepository extends JpaRepository<AdminNote, Long> {
    List<AdminNote> findByAdminOrderByCreatedAtDesc(User admin);
}
