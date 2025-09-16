package com.example.sortIt.api;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class Score implements Comparable<Score> {

    @NotBlank
    private String name;

    @Min(0)
    private int score;

    public Score() { }

    public Score(String name, int score) {
        this.name = name;
        this.score = score;
    }

    public String getName() { return name; }
    public int getScore() { return score; }

    public void setName(String name) { this.name = name; }
    public void setScore(int score) { this.score = score; }

    @Override
    public int compareTo(Score o) {
        return Integer.compare(o.score, this.score); // descending
    }
}