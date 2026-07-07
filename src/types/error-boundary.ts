export type ErrorFallbackProps = {
  error: Error & { digest?: string };
  reset: () => void;
  variant?: "public" | "admin";
};

export type LoadingSpinnerProps = {
  message?: string;
  variant?: "public" | "admin";
};

export type NotFoundContentProps = {
  area?: "public" | "admin";
};
