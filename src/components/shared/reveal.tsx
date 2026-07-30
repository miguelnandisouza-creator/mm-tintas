"use client";

import type { ComponentProps } from "react";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

type RevealProps = ComponentProps<typeof motion.div> & {
  delay?: number;
};

export function Reveal({ className, delay = 0, children, ...props }: RevealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{
        duration: reduceMotion ? 0 : 0.55,
        delay: reduceMotion ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
