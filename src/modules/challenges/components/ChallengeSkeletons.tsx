import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "../../../components/ui/card";
import { Skeleton } from "../../../components/ui/skeleton";

export function ChallengeSkeleton({
  withBadge = true,
}: {
  withBadge?: boolean;
}) {
  return (
    <Card className={`overflow-hidden metallic-card`}>
      <CardHeader className='pb-3'>
        <div className='flex justify-between items-start mb-1'>
          <div className='flex items-center gap-2'>
            <Skeleton className='h-5 w-5 rounded-full' />
            <Skeleton className='h-6 w-48' />
          </div>
          {withBadge && <Skeleton className='h-5 w-20' />}
        </div>
        <Skeleton className='h-4 w-full mt-2' />
        <Skeleton className='h-4 w-3/4 mt-1' />
      </CardHeader>
      <CardContent className='text-sm pb-3 space-y-2'>
        <Skeleton className='h-4 w-36' />
        <Skeleton className='h-4 w-28' />
      </CardContent>
      <CardFooter className='pt-0 pb-4'>
        <Skeleton className='h-8 w-full' />
      </CardFooter>
    </Card>
  );
}

export function CompletedChallengeSkeleton() {
  return (
    <Card className='overflow-hidden metallic-card'>
      <CardHeader className='pb-3'>
        <div className='flex justify-between items-start mb-1'>
          <div className='flex items-center gap-2'>
            <Skeleton className='h-5 w-5 rounded-full' />
            <Skeleton className='h-6 w-48' />
          </div>
          <Skeleton className='h-4 w-16' />
        </div>
        <div className='flex flex-wrap gap-2 mb-2'>
          <Skeleton className='h-5 w-24 rounded-full' />
          <Skeleton className='h-5 w-32 rounded-full' />
        </div>
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-2/3 mt-1' />
      </CardHeader>
      <CardContent className='pb-4'>
        <Skeleton className='h-4 w-40 mb-2' />
        <Skeleton className='h-4 w-32' />
      </CardContent>
    </Card>
  );
}

export function UserChallengesListSkeleton() {
  return (
    <div className='mt-8'>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        {[1, 2].map((index) => (
          <ChallengeSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

export function UniversalChallengesListSkeleton() {
  return (
    <div className='mb-8'>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        {[1, 2].map((index) => (
          <ChallengeSkeleton key={index} withBadge={true} />
        ))}
      </div>
    </div>
  );
}

export function CompletedChallengesListSkeleton() {
  return (
    <div className='mt-8 pt-4'>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        {[1, 2].map((index) => (
          <ChallengeSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
