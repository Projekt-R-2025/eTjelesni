package com.etjelesni.backend.repository;

import com.etjelesni.backend.enumeration.RequestStatus;
import com.etjelesni.backend.model.RoleRequest;
import com.etjelesni.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoleRequestRepository extends JpaRepository<RoleRequest, Long> {

    boolean existsByUserAndStatus(User user, RequestStatus status);

    @Query("SELECT r FROM RoleRequest r WHERE r.status = 'PENDING' " +
            "ORDER BY r.createdAt ASC")
    List<RoleRequest> findAllPendingRequests();

    List<RoleRequest> findByUser(User user);

    List<RoleRequest> findByStatus(RequestStatus status);

}
