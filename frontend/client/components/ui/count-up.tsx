import { useEffect, useRef, useState } from "react";

type Props = {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
};

export default function CountUp({
  end,
  duration = 1200,
  prefix = "",
  suffix = "",
}: Props) {
  const [val, setVal] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    let raf = 0;
    const step = (t: number) => {
      if (startRef.current == null) startRef.current = t;
      const p = Math.min(1, (t - startRef.current) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(end * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [end, duration]);

  return (
    <span>
      {prefix}
      {val.toLocaleString()}
      {suffix}
    </span>
  );
}
