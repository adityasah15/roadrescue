package com.roadrescue.config;

import com.roadrescue.repository.ShopRepository;
import com.roadrescue.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ScriptUtils;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;

/**
 * Loads the bundled sample data (db/seed.sql) on first boot when
 * SEED_DEMO_DATA=true. Only runs when the shops table is empty, so it
 * never overwrites real data on subsequent restarts.
 *
 * Intended for demo/evaluation deployments. Leave SEED_DEMO_DATA unset
 * (default false) in normal use.
 */
@Component
public class DemoDataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoDataSeeder.class);

    private final DataSource dataSource;
    private final ShopRepository shopRepository;
    private final UserRepository userRepository;

    @Value("${seed.demo.data:false}")
    private boolean seedDemoData;

    public DemoDataSeeder(DataSource dataSource,
                          ShopRepository shopRepository,
                          UserRepository userRepository) {
        this.dataSource = dataSource;
        this.shopRepository = shopRepository;
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) {
        if (!seedDemoData) return;

        long shops = shopRepository.count();
        long customers = userRepository.findAll().stream()
                .filter(u -> "CUSTOMER".equals(u.getRole()))
                .count();

        if (shops > 0 || customers > 0) {
            log.info(">>> Demo seeding skipped: database already has data (shops={}, customers={})", shops, customers);
            return;
        }

        log.info(">>> SEED_DEMO_DATA=true and database is empty — loading sample data...");
        try (Connection conn = dataSource.getConnection()) {
            ScriptUtils.executeSqlScript(conn, new ClassPathResource("db/seed.sql"));
            log.info(">>> Sample data loaded: 15 customers, 12 shops, 22 requests.");
        } catch (Exception e) {
            log.error(">>> Demo data seeding failed: {}", e.getMessage(), e);
        }
    }
}
