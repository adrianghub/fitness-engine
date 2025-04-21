# Daily Challenge Refresh Process

## Overview

The Fitness Engine automatically refreshes user challenges every day at 00:00 (Europe/Warsaw time). This process ensures that users receive a fresh set of challenges daily, maintains engagement through a points-based penalty system, and prevents challenge repetition.

## Process Flow

1. **Challenge Processing & Penalties**
   - System identifies incomplete challenges (status: "not-started", "in-progress", or "uncompleted") from the previous day
   - Points penalty is calculated based on the total points of incomplete challenges
   - All challenges (completed and incomplete) are removed from the database regardless of retry count
   - User's points are reduced by the penalty amount if applicable

2. **Challenge History Tracking**
   - System tracks IDs of regular challenges from the past 24 hours
   - Only recent regular challenges (today/yesterday) are considered for repetition prevention
   - This allows regular challenges to return to rotation after 24 hours
   - Universal challenges are not tracked and can be repeated

3. **New Challenge Generation**
   - System retrieves available challenge templates for the user's level
   - Recently used regular challenges are filtered out to prevent repetition
   - New challenges are generated following the standard distribution:
     - 1 daily challenge
     - 4 regular challenges
     - 4 universal challenges
   - AI recommendations are used for regular challenge selection when available

## Challenge Retry System

During the day, users can retry uncompleted challenges with the following rules:
- Each challenge can be attempted up to 3 times on the same day
- The system tracks retry count per challenge
- After 3 unsuccessful attempts, the challenge is permanently uncompleted for that day
- All challenges and their retry counts are reset at midnight during the refresh process
- Retries only apply within the same day; the next day brings completely new challenges

## Points System

- Users lose points for all incomplete challenges during the nightly refresh
- The penalty equals the sum of points from all incomplete challenges
- Points are deducted only during the midnight refresh process, not during individual challenge expirations
- This allows users to retry challenges during the day without immediate penalties
- Completed challenges contribute to the user's point total

## Technical Implementation

The process is implemented as part of the `dailyChallengeAndOpponentUpdate` scheduled function, which:
1. Runs the challenge refresh process for all users with completed profiles
2. Updates opponent scores
3. Maintains the leaderboard

### Database Operations
- All operations for a user are executed in a single batch for atomicity
- Challenges are stored in the `userChallenges` collection
- Each challenge document contains: userId, challengeId, type, status, points, assignedAt, retriesLeft
- Efficient indexes are maintained for quick querying

## Error Handling

- Each user is processed independently
- If processing fails for one user, the system continues with the next user
- All operations within a user's refresh are handled in a single batch
- Detailed error logging is implemented for debugging
- Failed operations are logged but don't prevent other users from being processed

## Best Practices

1. **Challenge Distribution**
   - Maintain variety by preventing consecutive repetition of regular challenges
   - Keep universal challenges in rotation
   - Use AI recommendations for personalized challenge selection
   - Ensure appropriate difficulty based on user level

2. **Database Management**
   - Clean slate approach: remove all challenges daily regardless of retry count
   - Use batch operations for atomic updates
   - Maintain efficient indexes for quick querying
   - Consider implementing challenge history archival if needed

3. **User Experience**
   - Allow retries within the same day to encourage persistence
   - Apply penalties fairly and transparently during nightly refresh
   - Ensure new challenges are appropriate for user's level
   - Maintain challenge variety through proper filtering
   - Prevent challenge fatigue by allowing challenges to return after 24 hours

## Testing

The process can be tested locally using the Firebase Emulator Suite:
- Use the `triggerDailyChallengeRefresh` endpoint in development
- Endpoint processes all users with completed profiles
- Results can be monitored in Firebase Emulator UI

## Future Considerations

1. **Performance Optimization**
   - Consider batch processing for large user bases
   - Implement caching for frequently accessed challenge templates
   - Monitor database query performance

2. **Feature Extensions**
   - Challenge history tracking
   - Challenge completion statistics
   - User preference-based challenge selection
   - Dynamic difficulty adjustment

3. **Monitoring**
   - Track challenge completion rates
   - Monitor penalty distribution
   - Analyze user engagement patterns
   - Set up alerts for abnormal patterns