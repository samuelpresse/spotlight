import { Box } from "@chakra-ui/react";

const fireflies = [
  { top: "12%", left: "8%", size: "2", delay: "0s", duration: "5s" },
  { top: "28%", left: "88%", size: "1.5", delay: "1.2s", duration: "6s" },
  { top: "62%", left: "5%", size: "1.5", delay: "2.4s", duration: "7s" },
  { top: "78%", left: "92%", size: "2", delay: "0.6s", duration: "5.5s" },
  { top: "8%", left: "70%", size: "1", delay: "3s", duration: "6.5s" },
  { top: "45%", left: "96%", size: "1", delay: "1.8s", duration: "4.5s" },
  { top: "88%", left: "18%", size: "1", delay: "2s", duration: "6s" },
  { top: "40%", left: "2%", size: "1", delay: "3.6s", duration: "5s" },
];

export function Fireflies({ onDark = false }: { onDark?: boolean }) {
  return (
    <>
      {fireflies.map((f, i) => (
        <Box
          key={i}
          position="absolute"
          top={f.top}
          left={f.left}
          boxSize={f.size}
          rounded="full"
          bg={onDark ? "silver.100" : { base: "brand.400", _dark: "silver.100" }}
          boxShadow={
            onDark
              ? "0 0 12px 4px var(--chakra-colors-brand-300)"
              : {
                  base: "0 0 10px 3px var(--chakra-colors-brand-300)",
                  _dark: "0 0 12px 4px var(--chakra-colors-brand-300)",
                }
          }
          animation={`firefly ${f.duration} ease-in-out ${f.delay} infinite`}
          _motionReduce={{ animation: "none" }}
          pointerEvents="none"
          zIndex={1}
        />
      ))}
    </>
  );
}
