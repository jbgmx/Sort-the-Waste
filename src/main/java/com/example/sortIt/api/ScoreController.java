package com.example.sortIt.api;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;

@RestController
@RequestMapping("/api")
public class ScoreController {

    // In-memory store for demo. Replace with a DB later if you like.
    private final List<Score> scores = new CopyOnWriteArrayList<>();

    @GetMapping("/leaderboard")
    public List<Score> leaderboard() {
        return scores.stream()
                .sorted()
                .limit(10)
                .toList();
    }

    @PostMapping("/score")
    public ResponseEntity<?> submit(@Valid @RequestBody Score score) {
        // Basic sanitisation
        String cleanName = score.getName().trim();
        if (cleanName.length() > 20) {
            cleanName = cleanName.substring(0, 20);
        }
        scores.add(new Score(cleanName, Math.max(0, score.getScore())));
        return ResponseEntity.ok(Map.of("status", "ok"));
    }
}
