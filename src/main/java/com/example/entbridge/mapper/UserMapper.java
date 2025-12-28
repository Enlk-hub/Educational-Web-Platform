package com.example.entbridge.mapper;

import com.example.entbridge.dto.AdminDtos;
import com.example.entbridge.dto.AuthDtos;
import com.example.entbridge.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface UserMapper {
    @Mapping(source = "fullName", target = "name")
    @Mapping(source = "role", target = "isAdmin", qualifiedByName = "roleToIsAdmin")
    AuthDtos.UserDto toAuthDto(User user);

    @Mapping(source = "fullName", target = "name")
    @Mapping(source = "role", target = "isAdmin", qualifiedByName = "roleToIsAdmin")
    AdminDtos.UserSummaryDto toSummary(User user);

    @Named("roleToIsAdmin")
    default boolean roleToIsAdmin(User.Role role) {
        return User.Role.ADMIN.equals(role);
    }

    default String map(Long value) {
        return value == null ? null : value.toString();
    }
}
