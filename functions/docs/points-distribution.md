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

### Daily Distribution Scenarios

1. **Daily from Regular Pool**
   ```
   Distribution: 1 Daily (R) + 4 Regular + 4 Universal

   Maximum Points:
   Beginner:     100 + (4×50) + (4×15) = 360
   Intermediate: 200 + (4×100) + (4×30) = 720
   Advanced:     300 + (4×150) + (4×45) = 1,080
   ```

2. **Daily from Universal Pool**
   ```
   Distribution: 1 Daily (U) + 5 Regular + 3 Universal

   Maximum Points:
   Beginner:     100 + (5×50) + (3×15) = 395
   Intermediate: 200 + (5×100) + (3×30) = 790
   Advanced:     300 + (5×150) + (3×45) = 1,185
   ```

## Level Progression

### Point Ranges
```
Level         Range          Maximum
Beginner      0 - 3,800     4,000
Intermediate  4,000 - 7,800  8,000
Advanced      8,000 - 14,800 15,000
```

### Opponent Distribution
Points spread across ranges:
- Lower (35%): 1-4 days worth
- Middle (40%): 4-7 days worth
- Upper-Middle (20%): 7-9 days worth
- Top (5%): 9-10 days worth

> Note: For implementation details and system features, see [System Summary](system-summary.md)

## Daily Challenge Structure

### Challenge Types and Points
1. **Daily Challenge (1x)**
   - Selected from either regular or universal pool
   - Points:
     - Beginner: 100
     - Intermediate: 200
     - Advanced: 300

2. **Regular Challenges**
   - 4-5 challenges (4 if daily is from regular pool, 5 if from universal)
   - Points per challenge:
     - Beginner: 50
     - Intermediate: 100
     - Advanced: 150

3. **Universal Challenges**
   - 3-4 challenges (3 if daily is from universal pool, 4 if from regular)
   - Points per challenge:
     - Beginner: 15
     - Intermediate: 30
     - Advanced: 45

### Maximum Daily Points
**When daily is from regular pool:**
- Beginner: 360 points (100 + 4×50 + 4×15)
- Intermediate: 720 points (200 + 4×100 + 4×30)
- Advanced: 1,080 points (300 + 4×150 + 4×45)

**When daily is from universal pool:**
- Beginner: 395 points (100 + 5×50 + 3×15)
- Intermediate: 790 points (200 + 5×100 + 3×30)
- Advanced: 1,185 points (300 + 5×150 + 3×45)

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
- 5 Regular Challenges (medium points)
- 4 Universal Challenges (base points)
- Total: 10 challenges per day

### Challenge Completion Strategy
1. **Priority Order**
   - Daily Challenge (highest point value)
   - Regular Challenges (significant point value)
   - Universal Challenges (consistent base points)

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
   - Achievable level transitions

3. **Competition**
   - Opponents at all skill levels
   - Dynamic point changes
   - Buffer between opponent max and user max

4. **Progression**
   - ~10 days per level for active users
   - Points reset on level up
   - Increased rewards at higher levels

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