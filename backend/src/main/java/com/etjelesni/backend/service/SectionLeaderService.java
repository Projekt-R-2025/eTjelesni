package com.etjelesni.backend.service;

import com.etjelesni.backend.enumeration.Role;
import com.etjelesni.backend.model.Section;
import com.etjelesni.backend.model.SectionLeader;
import com.etjelesni.backend.model.User;
import com.etjelesni.backend.repository.SectionLeaderRepository;
import com.etjelesni.backend.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class SectionLeaderService {

    private final SectionLeaderRepository sectionLeaderRepository;
    private final UserRepository userRepository;


    public boolean isUserLeaderOfSection(User user, Section section) {
        return sectionLeaderRepository.existsByLeaderAndSection(user, section);
    }

    public void assignLeaderToSection(User user, Section section) {
        // Create and save SectionLeader entity
        SectionLeader sectionLeader = new SectionLeader();
        sectionLeader.setLeader(user);
        sectionLeader.setSection(section);
        sectionLeaderRepository.save(sectionLeader);

        // Update user's leadingSectionIds
        List<Long> leadingSectionIds = user.getLeadingSectionIds();
        if (!leadingSectionIds.contains(section.getId())) {
            leadingSectionIds.add(section.getId());
            user.setLeadingSectionIds(leadingSectionIds);
            userRepository.save(user);
        }
    }

    public void removeLeaderFromSection(User user, Section section) {
        // Find and delete SectionLeader entity
        SectionLeader sectionLeader = sectionLeaderRepository.findByLeaderAndSection(user, section)
                .orElseThrow(() -> new IllegalStateException("User is not a leader of this section"));
        sectionLeaderRepository.delete(sectionLeader);

        // Update user's leadingSectionIds
        List<Long> leadingSectionIds = user.getLeadingSectionIds();
        leadingSectionIds.remove(section.getId());
        user.setLeadingSectionIds(leadingSectionIds);

        // If user is no longer a leader of any section, set role to STUDENT
        if (leadingSectionIds.isEmpty()) {
            user.setRole(Role.STUDENT);
        }

        userRepository.save(user);
    }

}
