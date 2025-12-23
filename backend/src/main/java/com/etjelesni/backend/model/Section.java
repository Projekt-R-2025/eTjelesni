package com.etjelesni.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "sections")
@Data
public class Section {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String name;

    @NotNull
    @Column(nullable = false)
    private Integer passingPoints;

    @Column(nullable = false)
    private Boolean isLocked = false;

    @Column(nullable = false)
    private Boolean isBikeSection = false;

    @ManyToOne
    @JoinColumn(name = "semester_id", nullable = false)
    private Semester semester;

    @ManyToMany
    @JoinTable(
        name = "section_leaders",
        joinColumns = @JoinColumn(name = "section_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<User> leaders;

    @OneToMany(mappedBy = "section", cascade = CascadeType.REMOVE)
    private List<Session> sessions;

    @OneToMany(mappedBy = "section", cascade = CascadeType.REMOVE)
    private List<Application> applications;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

}
