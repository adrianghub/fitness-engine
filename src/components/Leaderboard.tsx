import { Link } from "@tanstack/react-router";

interface RankingEntry {
  id: string;
  name: string;
  points: number;
  rank: number;
  isUser: boolean;
}

export function Leaderboard() {
  const mockRankings: RankingEntry[] = [
    { id: "u1", name: "Sarah Jones", points: 1250, rank: 1, isUser: false },
    { id: "current", name: "John Doe", points: 980, rank: 2, isUser: true },
    { id: "u2", name: "Mike Smith", points: 870, rank: 3, isUser: false },
    { id: "u3", name: "Emma Wilson", points: 820, rank: 4, isUser: false },
    { id: "u4", name: "Alex Turner", points: 750, rank: 5, isUser: false },
  ];

  return (
    <div className='max-w-4xl mx-auto px-4 py-8'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold'>Leaderboard</h1>
        <Link
          to='/dashboard'
          className='text-accent-foreground hover:text-accent-foreground/80'
        >
          Back to Dashboard
        </Link>
      </div>

      <div className='bg-background shadow-lg rounded-lg overflow-hidden'>
        <div className='p-4 bg-accent-foreground text-background flex items-center justify-between'>
          <div className='font-medium'>Global Rankings</div>
          <div>
            Total points: {mockRankings.find((r) => r.isUser)?.points || 0}
          </div>
        </div>

        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-background'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                Rank
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                User
              </th>
              <th className='px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                Points
              </th>
            </tr>
          </thead>
          <tbody className='bg-background divide-y divide-border'>
            {mockRankings.map((entry) => (
              <tr
                key={entry.id}
                className={entry.isUser ? "bg-accent-foreground" : ""}
              >
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='flex items-center'>
                    <div
                      className={`w-8 h-8 flex items-center justify-center rounded-full mr-3 ${
                        entry.rank <= 3
                          ? "bg-yellow-400 text-yellow-800"
                          : "bg-background text-muted-foreground"
                      }`}
                    >
                      {entry.rank}
                    </div>
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='font-medium text-foreground'>
                    {entry.name} {entry.isUser && "(You)"}
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                  {entry.points} pts
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
