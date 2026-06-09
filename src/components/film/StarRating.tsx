export function StarRating({ rating, max = 7 }: { rating: number; max?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className={`text-sm ${i < rating ? "text-orange-400" : "text-zinc-700"}`}
        >
          ★
        </span>
      ))}
    </span>
  );
}