package com.etjelesni.backend.controller;

import com.etjelesni.backend.service.RoleRequestService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/role-requests")
public class RoleRequestController {

    private RoleRequestService roleRequestService;

    public RoleRequestController(RoleRequestService roleRequestService) {
        this.roleRequestService = roleRequestService;
    }

}
