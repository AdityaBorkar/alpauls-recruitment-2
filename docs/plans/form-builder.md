# Form Builder — Schema-Driven Smart Fields

## Problem

Forms are the most repetitive code in the app. Each form manually builds the same `space-y-2` + `Label` + `Input` + `onChange` structure. There is no client-side validation — Zod schemas exist only in `src/rpc/schema/` for server-side oRPC validation. The same types are duplicated as manual `FormValues` interfaces in each form component.

## Solution

A `<SchemaForm>` + `<SmartField>` system that auto-derives field rendering from Zod schemas. Shared schemas become the single source of truth for both validation and UI hints.

## Architecture

### Components

```
src/components/forms/
├── schema-form.tsx          # <SchemaForm> — wraps <form>, provides context
├── smart-field.tsx           # <SmartField> — reads context, renders field
├── form-context.ts           # React context for schema resolution
├── use-schema-form.ts        # Hook: schema introspection, default derivation
├── field-renderers/
│   ├── string-field.tsx       # z.string() → Input/Textarea/Password
│   ├── enum-field.tsx         # z.enum() → Select
│   ├── boolean-field.tsx      # z.boolean() → Switch/Checkbox
│   ├── number-field.tsx       # z.number() → Input[type=number]
│   ├── combobox-field.tsx     # component: "combobox" → Popover+Command
│   └── field-array.tsx        # z.array(z.object()) → useFieldArray rows
└── index.ts
```

### Schema Location

Form schemas live in `src/schema/*-form.ts` alongside Drizzle table definitions. RPC schemas in `src/rpc/schema/` re-export them.

```
src/schema/
├── client.ts              # Drizzle
├── client-form.ts         # Zod with meta
├── client-contract.ts     # Drizzle
├── client-contract-form.ts
├── auth.ts                # Drizzle
├── auth-form.ts           # Zod with meta
```

### Zod Meta Convention

`.meta()` is always the **last call** in the chain.

```ts
z.string().min(1).meta({ label: "Name", placeholder: "Acme Corp" })
z.string().optional().meta({ label: "Legal Name" })
z.enum(["active", "inactive"]).meta({ label: "Status" })
```

Meta keys:
- `label` — field label text
- `placeholder` — input placeholder
- `description` — help text below field
- `component` — override default component ("textarea", "password", "combobox", "checkbox")

### Convention-Based Field Mapping

| Zod type | Meta override | Rendered component |
|---|---|---|
| `z.string()` | — | `<Input type="text">` |
| `z.string().email()` | — | `<Input type="email">` |
| `z.string().url()` | — | `<Input type="url">` |
| `z.string()` | `component: "textarea"` | `<Textarea>` |
| `z.string()` | `component: "password"` | `<Input type="password">` |
| `z.enum([...])` | — | `<Select>` |
| `z.boolean()` | — | `<Switch>` |
| `z.boolean()` | `component: "checkbox"` | `<Checkbox>` |
| `z.number()` | — | `<Input type="number">` |
| `z.array(z.object(...))` | — | Field array (add/remove rows) |
| any | `component: "combobox"` | `<Combobox>` (caller provides options) |
| any | `overrides` prop on SmartField | Custom render function |

### API

```tsx
<SchemaForm
  schema={clientFormSchema}
  onSubmit={(values) => mutation.mutate(values)}
  onInvalid={(errors) => ...}
  defaultValues={existingClient}
  validationMode="onBlur"
  className="space-y-6"
  ref={formRef}
>
  {({ watch, setValue }) => (
    <>
      <SmartField name="name" />
      <SmartField name="assigneeId" config={{ options: userOptions }} />
      <div className="grid grid-cols-2 gap-4">
        <SmartField name="startDate" />
        <SmartField name="endDate" />
      </div>
      <SmartField
        name="logo"
        overrides={({ field, config }) => (
          <LogoUpload url={field.value} onUrlChange={field.onChange} />
        )}
      />
      {watch("role") === "custom" && <SmartField name="permissions" overrides={...} />}
      <Button type="submit" disabled={isPending}>Create</Button>
    </>
  )}
</SchemaForm>
```

### Props

**SchemaForm:**
- `schema: z.ZodObject` — the form schema
- `onSubmit: (values: z.output<T>) => void` — receives Zod-parsed output
- `onInvalid?: (errors) => void` — optional validation failure callback
- `defaultValues?: Partial<z.input<T>>` — override schema-derived defaults
- `validationMode?: "onBlur" | "onChange" | "onSubmit" | "all"` — default "onBlur"
- `className?: string` — applied to `<form>`
- `children: (methods: UseFormReturn) => ReactNode` — render prop
- `ref?: Ref<UseFormReturn>` — imperative access

**SmartField:**
- `name: string` — field name matching schema key
- `disabled?: boolean` — visual + excluded from submit
- `config?: Record<string, any>` — runtime data (options, accessors, etc.)
- `overrides?: (props: { field, config, error }) => ReactNode` — custom render

### Error Handling

- **Client-side**: SmartField renders inline error below input (destructive color)
- **Server-side**: Caller shows toast. SchemaForm accepts no server error prop.

### Default Values

Schema-derived from Zod type: `z.string()` → `""`, `z.boolean()` → `false`, `z.array()` → `[]`, `z.number()` → `0`, `z.enum()` → first value. Override via `defaultValues` prop.

### Nullable / Optional

- No `nullable()` in schemas — use `optional()` only
- Eliminates null vs undefined distinction in form values

### Hidden Fields

No `meta({ hidden: true })`. Caller simply omits `<SmartField name="id" />`. Value stays in `defaultValues` and flows through on submit.

### Combobox Field

Generic `ComboboxField` wrapping shadcn Popover + Command. Accepts:
- `options` — array of items
- `getOptionLabel` — default: `option.label ?? option.name`
- `getOptionValue` — default: `option.value ?? option.id`
- `searchPlaceholder`, `emptyMessage`

### Field Arrays

Uses react-hook-form `useFieldArray` under the hood. Default render: vertical stack of rows, each row is horizontal flex of nested fields + trash button, "Add" button at bottom. Detailed design deferred.

## Implementation Steps

1. Install `react-hook-form` + `@hookform/resolvers`
2. Build `use-schema-form.ts` — Zod v4 introspection + default derivation
3. Build `form-context.ts` — schema field map in React context
4. Build field renderers — string, enum, boolean, number, combobox
5. Build `smart-field.tsx` — reads context, delegates to renderer
6. Build `schema-form.tsx` — form wrapper + react-hook-form + render prop
7. Build `index.ts` — public exports
8. Create form schemas in `src/schema/` with meta
9. Refactor RPC schemas to re-export from form schemas
10. Migrate `ClientForm` to SchemaForm as proof of concept
11. Migrate `ContractForm` and `MemberForm`
