# Database Transactions

## Overview

Database transactions are a fundamental concept in data management that ensure data integrity and consistency when performing multiple related operations. A transaction is a unit of work that bundles multiple steps into a single, atomic operation - either all steps complete successfully, or none of them do.

## Why Use Transactions?

1. **Atomicity**
   - All operations in a transaction either succeed together or fail together
   - No partial updates that could leave data in an inconsistent state
   - If any operation fails, all changes are automatically rolled back

2. **Consistency**
   - Data remains in a valid state before and after the transaction
   - All related data updates happen together
   - Business rules and constraints are maintained

3. **Isolation**
   - Concurrent operations don't interfere with each other
   - Each transaction operates as if it were the only one running
   - Prevents race conditions and data corruption

4. **Durability**
   - Once a transaction is committed, changes are permanent
   - Data survives system failures
   - Creates reliable audit trail

## When to Use Transactions

Use transactions when:

1. **Multiple Related Updates**
   - Updating multiple documents that must stay in sync
   - Changing data across different collections
   - Operations that affect multiple users or entities

2. **Critical Business Operations**
   - Financial transactions
   - Point systems
   - User status changes
   - Competition or ranking updates

3. **Data Integrity Requirements**
   - Maintaining referential integrity
   - Enforcing business rules
   - Preventing orphaned records

## Implementation Pattern

### Basic Transaction Structure

```typescript
await db.runTransaction(async (transaction) => {
  // 1. Read necessary documents
  const doc1 = await transaction.get(ref1);
  const doc2 = await transaction.get(ref2);

  // 2. Validate conditions
  if (!doc1.exists || !doc2.exists) {
    throw new Error('Invalid state');
  }

  // 3. Perform calculations
  const newValue = calculateNewValue(doc1.data(), doc2.data());

  // 4. Write updates
  transaction.update(ref1, { field: newValue });
  transaction.update(ref2, { field: newValue });
});
```

### Best Practices

1. **Keep Transactions Small**
   - Minimize the number of operations
   - Reduce transaction time
   - Lower chance of conflicts

2. **Handle Errors Properly**
   - Catch and log transaction failures
   - Implement retry logic when appropriate
   - Provide clear error messages

3. **Validate Early**
   - Check conditions before making changes
   - Fail fast if prerequisites aren't met
   - Ensure data consistency

4. **Document Changes**
   - Log transaction steps
   - Track important state changes
   - Maintain audit history

## Example Use Cases

### 1. Point System Updates
```typescript
await db.runTransaction(async (tx) => {
  // Read user and points
  const userDoc = await tx.get(userRef);
  const pointsDoc = await tx.get(pointsRef);

  // Calculate new values
  const newPoints = calculatePoints(userDoc.data(), pointsDoc.data());

  // Update multiple documents
  tx.update(userRef, { points: newPoints });
  tx.update(leaderboardRef, { points: newPoints });
  tx.set(historyRef, { change: newPoints });
});
```

### 2. Status Changes
```typescript
await db.runTransaction(async (tx) => {
  // Validate current status
  const statusDoc = await tx.get(statusRef);
  if (!isValidTransition(statusDoc.data())) {
    throw new Error('Invalid transition');
  }

  // Update status and related data
  tx.update(statusRef, { status: 'new_status' });
  tx.update(historyRef, { timestamp: now });
});
```

## Performance Considerations

1. **Transaction Limits**
   - Maximum operation count (500 in Firestore)
   - Time limits for completion
   - Network bandwidth usage

2. **Optimization Strategies**
   - Batch similar operations
   - Use parallel processing when possible
   - Implement efficient queries

3. **Monitoring**
   - Track transaction success rates
   - Measure execution times
   - Monitor resource usage

## Common Pitfalls

1. **Transaction Size**
   - Too many operations in one transaction
   - Long-running transactions
   - Unnecessary operations

2. **Error Handling**
   - Not catching all error cases
   - Incomplete rollback handling
   - Missing retry logic

3. **Data Access**
   - Reading unnecessary documents
   - Not optimizing queries
   - Inefficient data structure

## Conclusion

Transactions are a powerful tool for maintaining data consistency and integrity. When used properly, they ensure that complex operations complete reliably and maintain system consistency. However, they should be used judiciously and with careful consideration of performance implications and system requirements.


## Batch Processing Expired Challenges

The system includes a scheduled function to process expired challenges in batch:

1. **Query Expired Challenges**
   - Find challenges past their expiration date
   - Filter for non-completed challenges

2. **Parallel Processing**
   - Process each expired challenge independently
   - Use individual transactions per challenge
   - Handle failures gracefully

3. **Monitoring**
   - Track batch processing success rate
   - Log processing duration
   - Monitor point impact