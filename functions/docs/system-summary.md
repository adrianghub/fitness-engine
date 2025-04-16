# Fitness Engine - System Summary

## Challenge Generation System

### Daily Challenge Distribution
Total: 9 challenges per day, distributed as follows:

1. **When Daily is from Regular Pool:**
   - 1 Daily Challenge (from regular)
   - 4 Regular Challenges
   - 4 Universal Challenges

2. **When Daily is from Universal Pool:**
   - 1 Daily Challenge (from universal)
   - 5 Regular Challenges
   - 3 Universal Challenges

> For detailed point calculations and maximums, see [Points Distribution](points-distribution.md)

### Core Features

1. **Challenge Selection**
   - Daily challenge selected from either pool
   - Challenge count adjusts dynamically
   - Universal challenges upgradeable to daily

2. **Level System**
   - Three progression tiers:
     - Beginner: 0 - 4,000
     - Intermediate: 4,000 - 8,000
     - Advanced: 8,000 - 15,000

3. **Competition Design**
   - Dynamic opponent distribution
   - Balanced progression path
   - Flexible challenge selection

### Recent Enhancements

1. **Distribution Logic**
   - Fixed total at 9 daily challenges
   - Dynamic pool adjustment
   - Improved challenge selection

2. **Implementation**
   - Enhanced challenge generation
   - Better pool management
   - Improved logging
   - Clear point calculations

3. **Documentation**
   - Streamlined documentation
   - Cross-referenced files
   - Clear system overview
   - Detailed points in dedicated file

> Note: For specific point values, calculations, and progression details, refer to [Points Distribution](points-distribution.md)

## Core Mechanics Implementation

### 1. Daily Challenge Structure
- **9 Total Daily Challenges**
  - 1 Daily Challenge (selected from regular challenges pool, highest reward)
  - 4 Regular Challenges (remaining from pool after daily selection)
  - 4 Universal Challenges (base reward)

### 2. Point System
**Daily Maximum Points by Level:**
```
Beginner:
- Daily Challenge: 100pts (upgraded from regular challenge)
- Regular: 50pts × 4 = 200pts
- Universal: 15pts × 4 = 60pts
Total: 360 points/day

Intermediate:
- Daily Challenge: 200pts (upgraded from regular challenge)
- Regular: 100pts × 4 = 400pts
- Universal: 30pts × 4 = 120pts
Total: 720 points/day

Advanced:
- Daily Challenge: 300pts (upgraded from regular challenge)
- Regular: 150pts × 4 = 600pts
- Universal: 45pts × 4 = 180pts
Total: 1,080 points/day
```

### 3. Level Progression
**Level Ranges:**
```
Beginner:
- Start: 0 points
- Range: 0 - 3,800
- Max: 4,000
- Time: ~11-12 days

Intermediate:
- Start: 4,000 points
- Range: 4,000 - 7,800
- Max: 8,000
- Time: ~11-12 days

Advanced:
- Start: 8,000 points
- Range: 8,000 - 14,800
- Max: 15,000
- Time: ~14-15 days
```

### 4. Opponent Distribution
- **35%** in lower range (1-4 days worth)
- **40%** in middle range (4-7 days worth)
- **20%** in upper-middle (7-9 days worth)
- **5%** in top range (9-10 days worth)

### 5. Dynamic Point Changes
- Bottom third: Up to 3 days worth of points
- Middle range: Up to 2 days worth of points
- Top range: Up to 1 day worth of points
- 65% chance increase / 35% decrease

## Key Features

### 1. Engagement Mechanics
- Daily reset of challenges
- Daily challenge selected from regular pool
- Mix of challenge types
- Progressive difficulty
- Consistent baseline through universal challenges

### 2. Competition Design
- Balanced opponent distribution
- Dynamic point changes
- Buffer zone for top performers
- Level-appropriate rewards

### 3. Progression System
- Clear level boundaries
- Reset on level-up
- Increased rewards at higher levels
- ~11-15 days per level progression

### 4. Balance Considerations
- Universal challenges provide steady progress
- Regular challenge upgraded to daily for extra motivation
- Regular challenges form core progression
- Point gaps prevent instant level-ups

## MVP Implementation

### Current Focus
- Basic progression loop
- Core challenge types (9 total daily)
- Essential point distribution
- Fundamental competition mechanics

### Achievements
- Implemented complete progression system
- Created balanced point distribution
- Established competitive framework
- Designed engaging daily loop

### Next Steps
1. User testing and feedback
2. Point balance adjustments
3. Challenge variety expansion
4. Additional engagement features

## Challenge Types and Distribution

Each day, users receive:
- 1 Daily Challenge (high points)
- 4 Regular Challenges (medium points)
- 3-4 Universal Challenges (low points)

Total: 8-9 challenges per day