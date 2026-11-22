# AGENTS.md — Project Conventions for AI Agents

## React 19 Ref Forwarding Convention

**React 19 makes `ref` a regular prop.** No `forwardRef` needed.

### Pattern

```tsx
// ✅ CORRECT — component spreads {...props}, ref flows through
export const Bold = ({ ref, ...props }: BoldProps & { ref?: Ref<HTMLButtonElement> }) => {
  return <Button {...props} />; // ref auto-forwarded via props
};

// ✅ CORRECT — component does NOT spread props, explicit ref needed
export const Heading = ({ ref, ...props }: HeadingProps) => {
  return <Select ref={ref} {...props} />; // explicit ref required
};
```

### Rules

| Scenario | Action |
|----------|--------|
| Component spreads `{...props}` to child | **Do NOT pass `ref={ref}`** — ref flows via props |
| Component does NOT spread props | **Must pass `ref={ref}` explicitly** to child |
| Never use `forwardRef` | React 19 handles ref as regular prop |

### Props Type

```tsx
export interface BoldProps extends Omit<ButtonProps, "onClick"> {
  ref?: Ref<HTMLButtonElement>;
}
```

### Component Audit (24 migrated)

All 24 components follow this pattern:

| Component | Spreads Props? | Ref Handling |
|-----------|----------------|--------------|
| Bold, Italic, Underline, Strikethrough, BulletList, OrderedList, Checklist, Undo, Redo, Link, Image, Video, Audio, Embed, Table, CodeBlock, Math | ✅ Yes | `// ref={ref}` commented, flows via `{...props}` |
| Heading | ❌ No | `ref={ref}` explicit on `<Select>` |
| Avatar, Img, Img2 | ✅ Yes | `ref` passed via props |

---

## Component File Export Convention

- Use **named exports only**: `export const Name = ...`
- No `export default` in component files
- Re-exports in `index.tsx`: `export { Name } from './Name'`

---

## TypeScript Conventions

- Use `type Ref = React.Ref` for ref types
- Add `ref?: Ref<ElementType>` to props interface
- Keep `displayName` for DevTools debugging

---

## Last Updated

2026-11-22 — React 19 ref forwarding convention documented after batch migration of 24 components.