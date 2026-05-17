import { SchemaForm, SmartField } from "@/components/forms"
import { Button } from "@/components/ui/button"
import { memberFormSchema, memberUpdateFormSchema } from "@/schema/auth-form"

import { PermissionsEditor } from "./permissions-editor"
import { SupervisorCombobox } from "./supervisor-combobox"

type RoleCode =
  | "admin"
  | "bd"
  | "caller"
  | "custom"
  | "qc"
  | "rm"
  | "sc"
  | "tl"

type UserOption = {
  id: string
  name: string
  email: string
  role: string | null
}

type MemberFormProps = {
  mode: "create" | "edit"
  onSubmit: (values: Record<string, any>) => void
  isPending: boolean
  users?: UserOption[]
  excludeUserId?: string
  defaultValues?: Record<string, any>
}

export function MemberForm({
  mode,
  onSubmit,
  isPending,
  users = [],
  excludeUserId,
  defaultValues,
}: MemberFormProps) {
  const schema = mode === "create" ? memberFormSchema : memberUpdateFormSchema

  return (
    <SchemaForm
      className="space-y-6"
      defaultValues={defaultValues}
      onSubmit={onSubmit as any}
      schema={schema}
    >
      {({ watch }) => {
        const currentRole = watch("role")
        const showPassword = mode === "create"
        const showPermissions = currentRole === "custom"
        const isAdmin = currentRole === "admin"

        return (
          <>
            <SmartField name="name" />
            <SmartField name="email" />
            {showPassword && <SmartField name="password" />}
            <SmartField name="role" />
            <SmartField
              disabled={isAdmin}
              name="supervisorId"
              config={{
                options: users,
                getOptionLabel: (o: UserOption) => o.name,
                getOptionValue: (o: UserOption) => o.id,
                searchPlaceholder: "Search users...",
              }}
              overrides={({ field, disabled: fieldDisabled }) => (
                <SupervisorCombobox
                  disabled={fieldDisabled}
                  excludeUserId={excludeUserId}
                  onChange={field.onChange}
                  required={!isAdmin}
                  users={users}
                  value={field.value}
                />
              )}
            />
            {showPermissions && (
              <SmartField
                name="permissions"
                overrides={({ field }) => (
                  <PermissionsEditor
                    onChange={field.onChange}
                    value={field.value ?? {}}
                  />
                )}
              />
            )}
            <div className="flex gap-3">
              <Button disabled={isPending} type="submit">
                {mode === "create" ? "Add Member" : "Save Changes"}
              </Button>
            </div>
          </>
        )
      }}
    </SchemaForm>
  )
}

export type { MemberFormProps, RoleCode, UserOption }
