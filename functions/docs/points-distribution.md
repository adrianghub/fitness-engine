# Points Distribution

> This document is the primary reference for the points system. For system overview, see [System Summary](system-summary.md)

## Challenge Points

### Base Points per Challenge Type
```
                Beginner    Intermediate    Advanced
Daily            100          200           300
Regular           50          100           150
Universal         15           30            45
```

### Daily Distribution

```
Distribution: 1 Daily + 4 Regular + 4 Universal Challenges

Maximum Points:
Beginner:     100 + (4×50) + (4×15) = 360
Intermediate: 200 + (4×100) + (4×30) = 720
Advanced:     300 + (4×150) + (4×45) = 1,080
```

## Level Progression

### Requirements
- User must be #1 in their level's leaderboard to be eligible for promotion
- Levels progress from: beginner → intermediate → advanced
- Points are reset upon promotion

### Challenge Structure

1. **Daily Challenge (1x)**
   - Points:
     - Beginner: 100
     - Intermediate: 200
     - Advanced: 300

2. **Regular Challenges (4x)**
   - Points per challenge:
     - Beginner: 50
     - Intermediate: 100
     - Advanced: 150

3. **Universal Challenges (4x)**
   - Points per challenge:
     - Beginner: 15
     - Intermediate: 30
     - Advanced: 45

### Maximum Daily Points
- Beginner: 360 points (100 + 4×50 + 4×15)
- Intermediate: 720 points (200 + 4×100 + 4×30)
- Advanced: 1,080 points (300 + 4×150 + 4×45)


## Level Progression
1. **Beginner Level**
   - Range: 0 - 3,800 points
   - Max: 4,000 points

2. **Intermediate Level**
   - Range: 4,000 - 7,800 points
   - Max: 8,000 points

3. **Advanced Level**
   - Range: 8,000 - 14,800 points
   - Max: 15,000 points

## Opponent Distribution
- Lower Range (35%): 1-4 days worth of points
- Middle Range (40%): 4-7 days worth of points
- Upper-Middle (20%): 7-9 days worth of points
- Top Range (5%): 9-10 days worth of points

## Challenge Structure

### Daily Challenge Distribution
- 1 Daily Challenge (highest points)
- 4 Regular Challenges (medium points)
- 4 Universal Challenges (base points)
- Total: 9 challenges per day

### Challenge Completion Strategy
1. **Priority Order**
   - Daily Challenge (highest point value)
   - Regular Challenges (significant point value)
   - Universal Challenges (base points)

2. **Time Management**
   - Daily Challenge: ~30-45 minutes
   - Regular Challenges: ~20-30 minutes each
   - Universal Challenges: ~15-20 minutes each
   - Total estimated time: 2.5-4 hours for all challenges

## Design Principles

1. **Engagement**
   - Daily challenges provide consistent engagement
   - Mix of challenge types maintains interest
   - Universal challenges provide baseline progression

2. **Achievement**
   - Clear daily goals
   - Visible progression path
   - Must reach #1 in leaderboard to advance

3. **Competition**
   - Leaderboard-based progression
   - Dynamic point changes
   - Competitive advancement system

4. **Progression**
   - Points reset on level up
   - Increased rewards at higher levels
   - Merit-based advancement

## Implementation Notes

1. **Point Calculation**
   - Points are awarded immediately upon challenge completion
   - Failed or expired challenges result in lost point opportunity
   - Universal challenges provide consistent baseline progress

2. **Level Transition**
   - Points reset to base level on promotion
   - New opponents generated at new level
   - Challenge difficulty increases

3. **Opponent Generation**
   - Generated daily for consistency
   - Distribution ensures competition at all levels
   - Point changes maintain competitive balance

## Future Considerations

1. **Scaling**
   - Point ranges can be adjusted based on user engagement
   - Additional levels can be added
   - Challenge point values can be tuned

2. **Features**
   - Weekly/Monthly challenges
   - Special events
   - Bonus point opportunities
   - Achievement rewards