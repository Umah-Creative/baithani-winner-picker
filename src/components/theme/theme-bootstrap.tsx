const THEME_STORAGE_KEY = "baithani-winner-picker:theme";

const themeScript = `
  (() => {
    try {
      const stored = window.localStorage.getItem("${THEME_STORAGE_KEY}");
      const theme = stored === "light" || stored === "dark"
        ? stored
        : "light";
      const root = document.documentElement;
      root.classList.toggle("dark", theme === "dark");
      root.dataset.theme = theme;
      root.style.colorScheme = theme;
    } catch {}
  })();
`;

export function ThemeBootstrap(props: { nonce: string | undefined }) {
  const { nonce } = props;
  return (
    <script
      nonce={nonce}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: themeScript }}
    />
  );
}
