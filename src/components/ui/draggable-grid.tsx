"use client";

import {
  animate,
  cubicBezier,
  motion,
  useMotionValue,
  wrap,
} from "framer-motion";
import {
  memo,
  useContext,
  useEffect,
  useRef,
  useState,
  createContext,
} from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

type Variant = "default" | "masonry" | "polaroid";

const GridVariantContext = createContext<Variant | undefined>(undefined);

const rowVariants = {
  initial: { opacity: 0, scale: 0.3 },
  animate: () => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: Math.random() + 1.5,
      duration: 1.4,
      ease: cubicBezier(0.18, 0.71, 0.11, 1),
    },
  }),
};

export function DraggableContainer({
  className,
  children,
  variant,
}: {
  className?: string;
  children: React.ReactNode;
  variant?: Variant;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const [isDragging, setIsDragging] = useState(false);
  const handleIsDragging = () => setIsDragging(true);
  const handleIsNotDragging = () => setIsDragging(false);

  useEffect(() => {
    const container = ref.current?.getBoundingClientRect();
    if (!container) return;

    const { width, height } = container;

    const xDrag = x.on("change", (latest) => {
      const wrappedX = wrap(-(width / 2), 0, latest);
      x.set(wrappedX);
    });

    const yDrag = y.on("change", (latest) => {
      const wrappedY = wrap(-(height / 2), 0, latest);
      y.set(wrappedY);
    });

    const handleWheelScroll = (event: WheelEvent) => {
      if (!isDragging) {
        animate(y, y.get() - event.deltaY * 2.7, {
          type: "tween",
          duration: 1.2,
          ease: cubicBezier(0.18, 0.71, 0.11, 1),
        });
      }
    };

    const node = ref.current;
    node?.addEventListener("wheel", handleWheelScroll, { passive: true });
    return () => {
      xDrag();
      yDrag();
      node?.removeEventListener("wheel", handleWheelScroll);
    };
  }, [x, y, isDragging]);

  return (
    <GridVariantContext.Provider value={variant}>
      <div className="h-full overflow-hidden" ref={ref}>
        <motion.div
          className={cn(
            "grid h-fit w-fit cursor-grab grid-cols-[repeat(2,1fr)] active:cursor-grabbing will-change-transform",
            className
          )}
          drag
          dragMomentum={true}
          dragTransition={{
            timeConstant: 200,
            power: 0.28,
            restDelta: 0,
            bounceStiffness: 0,
          }}
          onMouseDown={handleIsDragging}
          onMouseUp={handleIsNotDragging}
          onMouseLeave={handleIsNotDragging}
          style={{ x, y }}
        >
          {children}
        </motion.div>
      </div>
    </GridVariantContext.Provider>
  );
}

export function GridItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const variant = useContext(GridVariantContext);

  const gridItemStyles = cva(
    "overflow-hidden hover:cursor-pointer w-full h-full will-change-transform",
    {
      variants: {
        variant: {
          default: "rounded-sm",
          masonry: "even:mt-[60%] rounded-sm",
          polaroid:
            "border-10 border-b-28 border-white shadow-xl even:rotate-3 odd:-rotate-2 hover:rotate-0 transition-transform ease-out duration-300 even:mt-[60%]",
        },
      },
      defaultVariants: { variant: "default" },
    }
  );

  return (
    <motion.div
      className={cn(gridItemStyles({ variant, className }))}
      variants={rowVariants}
      initial="initial"
      animate="animate"
    >
      {children}
    </motion.div>
  );
}

export const GridBody = memo(
  ({ children, className }: { children: React.ReactNode; className?: string }) => {
    const variant = useContext(GridVariantContext);

    const gridBodyStyles = cva("grid grid-cols-[repeat(6,1fr)] h-fit w-fit", {
      variants: {
        variant: {
          default: "gap-3 p-3 md:gap-5 md:p-5",
          masonry: "gap-x-3 px-3 md:gap-x-5 md:px-5",
          polaroid: "gap-x-3 px-3 md:gap-x-5 md:px-5",
        },
      },
      defaultVariants: { variant: "default" },
    });

    return (
      <>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className={cn(gridBodyStyles({ variant, className }))}>
            {children}
          </div>
        ))}
      </>
    );
  }
);

GridBody.displayName = "GridBody";
