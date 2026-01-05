package com.example.entbridge.mapper;

import com.example.entbridge.dto.AdminDtos;
import com.example.entbridge.dto.AuthDtos;
import com.example.entbridge.entity.User;
import java.time.Instant;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-01-06T02:27:02+0500",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.44.0.v20251118-1623, environment: Java 21.0.9 (Eclipse Adoptium)"
)
@Component
public class UserMapperImpl implements UserMapper {

    @Override
    public AuthDtos.UserDto toAuthDto(User user) {
        if ( user == null ) {
            return null;
        }

        String name = null;
        boolean isAdmin = false;
        String id = null;
        String email = null;
        String username = null;
        Instant createdAt = null;

        name = user.getFullName();
        isAdmin = roleToIsAdmin( user.getRole() );
        id = map( user.getId() );
        email = user.getEmail();
        username = user.getUsername();
        createdAt = user.getCreatedAt();

        AuthDtos.UserDto userDto = new AuthDtos.UserDto( id, name, email, username, isAdmin, createdAt );

        return userDto;
    }

    @Override
    public AdminDtos.UserSummaryDto toSummary(User user) {
        if ( user == null ) {
            return null;
        }

        String name = null;
        boolean isAdmin = false;
        String id = null;
        String email = null;
        String username = null;
        Instant createdAt = null;

        name = user.getFullName();
        isAdmin = roleToIsAdmin( user.getRole() );
        id = map( user.getId() );
        email = user.getEmail();
        username = user.getUsername();
        createdAt = user.getCreatedAt();

        AdminDtos.UserSummaryDto userSummaryDto = new AdminDtos.UserSummaryDto( id, name, email, username, isAdmin, createdAt );

        return userSummaryDto;
    }
}
