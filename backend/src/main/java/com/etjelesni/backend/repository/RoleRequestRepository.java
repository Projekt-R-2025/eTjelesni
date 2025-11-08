package com.etjelesni.backend.repository;

import com.etjelesni.backend.enumeration.RequestStatus;
import com.etjelesni.backend.enumeration.Role;
import com.etjelesni.backend.model.RoleRequest;
import com.etjelesni.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoleRequestRepository extends JpaRepository<RoleRequest, Long> {
    boolean existsByUserAndRequestedRoleAndStatus(User user, Role requestedRole, RequestStatus status);
    List<RoleRequest> findByStatus(RequestStatus status);
    List<RoleRequest> findByStatusAndRequestedRole(RequestStatus status, Role requestedRole);
    List<RoleRequest> findByUser(User user);
    List<RoleRequest> findByRequestedRole(Role requestedRole);
}
