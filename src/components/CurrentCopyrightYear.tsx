"use client";

import { useEffect, useState } from "react";

type CurrentCopyrightYearProps = {
  startYear: number;
};

export function CurrentCopyrightYear({
  startYear,
}: CurrentCopyrightYearProps) {
  const [currentYear, setCurrentYear] = useState(startYear);

  useEffect(() => {
    // Syncing browser clock after hydration — this is the canonical
    // use case for useEffect (external system → React state).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentYear(Math.max(startYear, new Date().getFullYear()));
  }, [startYear]);

  if (currentYear <= startYear) {
    return <>{startYear}</>;
  }

  return <>{startYear}–{currentYear}</>;
}
