import { cn } from "@/lib/utils";

export const REPOSITORY_URL =
  "https://github.com/Umah-Creative/baithani-winner-picker";

type AppFooterProps = {
  className?: string;
};

function GitHubMark() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className="size-4"
      aria-hidden="true"
    >
      <path d="M8 0C3.58 0 0 3.64 0 8.13c0 3.59 2.29 6.64 5.47 7.71.4.08.55-.18.55-.39 0-.19-.01-.82-.01-1.49-2.01.45-2.53-.5-2.69-.96-.09-.23-.48-.96-.82-1.16-.28-.15-.68-.52-.01-.53.63-.01 1.08.59 1.23.83.72 1.23 1.87.88 2.33.67.07-.53.28-.88.51-1.08-1.78-.21-3.64-.91-3.64-4.02 0-.89.31-1.62.82-2.19-.08-.2-.36-1.04.08-2.16 0 0 .67-.22 2.2.84A7.49 7.49 0 0 1 8 3.66a7.5 7.5 0 0 1 2 .27c1.53-1.06 2.2-.84 2.2-.84.44 1.12.16 1.96.08 2.16.51.57.82 1.29.82 2.19 0 3.12-1.87 3.81-3.65 4.02.29.25.54.74.54 1.5 0 1.08-.01 1.95-.01 2.22 0 .21.15.47.55.39A8.03 8.03 0 0 0 16 8.13C16 3.64 12.42 0 8 0Z" />
    </svg>
  );
}

export function AppFooter(props: AppFooterProps) {
  const { className } = props;

  return (
    <footer
      className={cn(
        "relative z-10 pt-4 text-center text-sm text-muted-foreground sm:pt-5",
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-center">
        <p>
          &copy; 2023–{new Date().getFullYear()} · Powered by{" "}
          <strong className="font-semibold text-foreground">
            Multimedia Baithani
          </strong>
          .
        </p>
        <a
          href={REPOSITORY_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View source on GitHub (opens in a new tab)"
          className="-my-2 ml-1 inline-grid size-10 place-items-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
        >
          <GitHubMark />
        </a>
      </div>
    </footer>
  );
}
