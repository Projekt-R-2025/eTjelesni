package com.etjelesni.backend.model;

import com.etjelesni.backend.enumeration.RequestStatus;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "applications")
@Data
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "applicant_id", nullable = false)
    private User applicant;

    @ManyToOne
    @JoinColumn(name = "section_id", nullable = false)
    private Section section;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus status = RequestStatus.PENDING;

    private String reason;

    @ManyToOne
    @JoinColumn(
            name = "reviewed_by",
            foreignKey = @ForeignKey(
                    name = "fk_role_request_reviewer",
                    foreignKeyDefinition = "FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL"
            )
    )
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
