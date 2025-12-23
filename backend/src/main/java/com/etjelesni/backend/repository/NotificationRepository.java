package com.etjelesni.backend.repository;

import com.etjelesni.backend.enumeration.NotificationType;
import com.etjelesni.backend.model.Notification;
import com.etjelesni.backend.model.Section;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findAllByType(NotificationType type);

    List<Notification> findAllByTypeAndSection(NotificationType type, Section section);

}
