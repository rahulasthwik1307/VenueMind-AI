import { m } from 'framer-motion';
import type { Variants, Transition } from 'framer-motion';

const stageTransition = (delay: number): Transition => ({
  duration: 0.35,
  ease: 'easeOut',
  delay,
});

const stageVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0 },
};

interface DigitalTwinWorkspaceProps {
  children: React.ReactNode;
}

export function DigitalTwinWorkspace({ children }: DigitalTwinWorkspaceProps) {
  return (
    <m.div
      variants={stageVariants}
      initial="hidden"
      animate="visible"
      transition={stageTransition(0.16)}
      className="flex-1 overflow-hidden"
    >
      {children}
    </m.div>
  );
}
