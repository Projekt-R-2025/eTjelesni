package com.etjelesni.backend.model;

import com.etjelesni.backend.enumeration.RequestStatus;
import com.etjelesni.backend.enumeration.Role;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "role_requests")
@Data
public class RoleRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role requestedRole;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus status = RequestStatus.PENDING;

    private String reason;

    @ManyToOne
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    private LocalDateTime reviewedAt;

    private String reviewNote;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

}
