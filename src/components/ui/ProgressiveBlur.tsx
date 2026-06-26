type Direction = "to-right" | "to-left" | "to-bottom" | "to-top";

type Props = {
  direction?: Direction;
  blur?: number;
  fadeSize?: string;
  noise?: number; // 0–1
  className?: string;
};

const gradientMap: Record<Direction, string> = {
  "to-right": "to right",
  "to-left": "to left",
  "to-bottom": "to bottom",
  "to-top": "to top",
};

export default function ProgressiveBlur({
  direction = "to-bottom",
  blur = 8,
  fadeSize = "80%",
  noise = 0.15,
  className,
}: Props) {
  const gradient = gradientMap[direction];
  const id = `pb-noise-${direction}`;

  return (
    <div
      className={className}
      style={{
        maskImage: `linear-gradient(${gradient}, transparent, black ${fadeSize})`,
        WebkitMaskImage: `linear-gradient(${gradient}, transparent, black ${fadeSize})`,
        backdropFilter: `blur(${blur}px)`,
        pointerEvents: "none",
      }}
    >
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: noise,
        }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id={id}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${id})`} />
      </svg>
    </div>
  );
}
