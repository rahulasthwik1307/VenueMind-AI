import { cn } from '../../utils/cn';


interface SkeletonLineProps {
  className?: string;
  width?: 'full' | '3/4' | '1/2' | '1/3' | '2/3';
}

export function SkeletonLine({ className, width = 'full' }: SkeletonLineProps) {
  const widthMap: Record<SkeletonLineProps['width'] & string, string> = {
    full: 'w-full',
    '3/4': 'w-3/4',
    '1/2': 'w-1/2',
    '1/3': 'w-1/3',
    '2/3': 'w-2/3',
  };

  return (
    <div
      className={cn('skeleton h-4 rounded', widthMap[width], className)}
      role="presentation"
      aria-hidden="true"
    />
  );
}
