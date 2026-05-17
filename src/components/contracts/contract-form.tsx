import { useQuery } from "@tanstack/react-query";

import { SchemaForm, SmartField } from "@/components/forms"
import { Button } from "@/components/ui/button"
import type { UserOption } from "@/components/contracts/types"
import { contractFormSchema, contractUpdateFormSchema } from "@/schema/client-contract-form"
import { orpc } from "@/rpc/client"

type ClientOption = {
  id: number
  name: string
}

type ContractFormProps = {
  mode: "create" | "edit"
  onSubmit: (values: Record<string, any>) => void
  isPending: boolean
  users?: UserOption[]
  excludeUserId?: string
  defaultValues?: Record<string, any>
}

export function ContractForm({
  mode,
  onSubmit,
  isPending,
  users = [],
  defaultValues,
}: ContractFormProps) {
  const schema = mode === "create" ? contractFormSchema : contractUpdateFormSchema

  const { data: clientsData } = useQuery(
    orpc.client.list.queryOptions({ input: { limit: 100 } }),
  )

  const clientOptions: ClientOption[] = (clientsData?.items ?? []).map((c) => ({
    id: c.id,
    name: c.name,
  }))

  const bdUsers = users.filter((u) => u.role === "admin" || u.role === "bd")
  const rmUsers = users.filter((u) => u.role === "admin" || u.role === "rm")

  return (
    <SchemaForm
      className="space-y-6"
      defaultValues={defaultValues}
      onSubmit={onSubmit as any}
      schema={schema}
    >
      {({ watch }) => {
        const title = watch("title")
        const clientId = watch("clientId")
        const assigneeId = watch("assigneeId")

        return (
          <>
            <SmartField name="title" />
            <SmartField name="referenceNumber" />
            <SmartField name="description" />
            <SmartField
              name="clientId"
              config={{
                options: clientOptions,
                getOptionLabel: (o: ClientOption) => o.name,
                getOptionValue: (o: ClientOption) => o.id,
                searchPlaceholder: "Search clients...",
              }}
            />
            <SmartField
              name="assigneeId"
              config={{
                options: bdUsers,
                getOptionLabel: (o: UserOption) => o.name,
                getOptionValue: (o: UserOption) => o.id,
                searchPlaceholder: "Search BD users...",
              }}
            />
            <SmartField
              name="rmId"
              config={{
                options: rmUsers,
                getOptionLabel: (o: UserOption) => o.name,
                getOptionValue: (o: UserOption) => o.id,
                searchPlaceholder: "Search RM users...",
              }}
            />
            <div className="grid grid-cols-3 gap-4">
              <SmartField name="startDate" />
              <SmartField name="endDate" />
              <SmartField name="signedDate" />
            </div>
            <SmartField name="pdfLink" />
            <SmartField name="status" />
            <div className="flex gap-3">
              <Button
                disabled={isPending || !title || !clientId || !assigneeId}
                type="submit"
              >
                {mode === "create" ? "Create Contract" : "Save Changes"}
              </Button>
            </div>
          </>
        )
      }}
    </SchemaForm>
  )
}

export type { ContractFormProps, ClientOption }
