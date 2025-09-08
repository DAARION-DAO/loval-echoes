import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

interface SkeletonListProps {
  count?: number;
  variant?: 'chat' | 'message' | 'compact';
  className?: string;
}

export const SkeletonList = ({ 
  count = 3, 
  variant = 'chat', 
  className = '' 
}: SkeletonListProps) => {
  const items = Array.from({ length: count }, (_, i) => i);

  const renderChatSkeleton = () => (
    <Card className="animate-fade-in">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-12" />
            </div>
            <Skeleton className="h-3 w-48" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-8" />
            </div>
          </div>
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </CardContent>
    </Card>
  );

  const renderMessageSkeleton = () => (
    <div className="flex gap-3 p-4 animate-fade-in">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  );

  const renderCompactSkeleton = () => (
    <div className="flex items-center gap-3 p-2 animate-fade-in">
      <Skeleton className="h-6 w-6 rounded" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-3 w-16 ml-auto" />
    </div>
  );

  const renderSkeleton = () => {
    switch (variant) {
      case 'message':
        return renderMessageSkeleton();
      case 'compact':
        return renderCompactSkeleton();
      default:
        return renderChatSkeleton();
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((item, index) => (
        <div
          key={item}
          style={{
            animationDelay: `${index * 100}ms`,
          }}
        >
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
};