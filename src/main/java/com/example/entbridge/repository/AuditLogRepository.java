package com.example.entbridge.repository;

import com.example.entbridge.entity.AuditLog;
import com.example.entbridge.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByAdminOrderByCreatedAtDesc(User admin);

    long countByAdmin(User admin);

    long countByAdminAndAction(User admin, String action);
}
