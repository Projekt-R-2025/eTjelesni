package com.etjelesni.backend.service;

import com.etjelesni.backend.repository.RoleRequestRepository;
import org.springframework.stereotype.Service;

@Service
public class RoleRequestService {

    private RoleRequestRepository roleRequestRepository;

    public RoleRequestService(RoleRequestRepository roleRequestRepository) {
        this.roleRequestRepository = roleRequestRepository;
    }


}
