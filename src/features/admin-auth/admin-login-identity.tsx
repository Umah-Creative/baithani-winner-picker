type AdminLoginIdentityProps = {
  identity: string;
  logoUrl?: string;
};

export function AdminLoginIdentity(props: AdminLoginIdentityProps) {
  const { identity, logoUrl } = props;

  return (
    <div className="mb-5 flex items-center gap-3 text-foreground">
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt={`${identity} logo`}
          className="size-11 rounded-xl border border-border bg-card object-contain p-1"
        />
      ) : (
        <div className="grid size-11 place-items-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
          B
        </div>
      )}
      <span className="font-semibold">{identity}</span>
    </div>
  );
}
