# TypeScript Style

Use with the core and relevant domain packs.

- Prefer `type` for object shapes, unions, mapped types, and composition when appropriate.
- Use `interface` when declaration merging, extension semantics, or a public contract materially improve clarity.
- Model data flow explicitly; avoid clever generic machinery that hides ownership.
- Keep boundary input and output types separate when transport shape differs from domain needs.
- Avoid `any`; use `unknown` at untrusted boundaries and narrow it deliberately.
- Keep runtime validation for external input. Static types do not validate network or user data.
- Prefer discriminated unions for meaningful state variants.
- Keep generated types isolated; do not manually patch generated output.
