package com.roadrescue;

import com.roadrescue.model.User;
import com.roadrescue.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class RoadRescueApplication {

    public static void main(String[] args) {
        SpringApplication.run(RoadRescueApplication.class, args);
    }

    // PasswordEncoder bean for hashing
    // @Bean
    // public PasswordEncoder passwordEncoder() {
    //     return new BCryptPasswordEncoder();
    // }

    // Create default admin if not exists
    @Bean
    CommandLineRunner run(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {

            // Create default admin if not exists
            if (userRepository.findByUsername("admin").isEmpty()) {
                userRepository.save(new User(null, "admin",
                        passwordEncoder.encode("admin123"), "ADMIN"));
            }

            // Automatically hash all existing users with plain-text passwords
            userRepository.findAll().forEach(user -> {
                if (!user.getPassword().startsWith("$2a$")) { // not hashed yet
                    user.setPassword(passwordEncoder.encode(user.getPassword()));
                    userRepository.save(user);
                }
            });

        };
    }
}