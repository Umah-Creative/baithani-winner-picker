# File Naming

Use names that show ownership and role quickly.

## Role Suffixes

Use a role suffix when it materially clarifies support-file purpose:

- `*.type.ts`
- `*.util.ts`
- `*.service.ts`
- `*.schema.ts`
- `*.factory.ts`
- `*.keys.ts`
- `*.options.ts`
- `*.normalizer.ts`
- `*.columns.ts`
- `*.constant.ts`
- `*.config.ts`

Do not invent or force suffixes for symmetry.

## Conventions

- Keep framework-reserved file names unchanged.
- Keep hooks in their conventional `use-*` form.
- Use singular names for one entity and plural names for collections or grouped exports.
- Prefer explicit feature entry names over `index` when ownership would otherwise be hidden.
- Avoid generic dumping-ground names such as `helpers`, `utils`, or `types` when a domain name can be used.
- Avoid broad barrels when they obscure ownership or create accidental coupling.
