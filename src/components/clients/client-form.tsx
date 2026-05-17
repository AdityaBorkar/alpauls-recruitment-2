import { useState } from "react";

import { Field, Form } from "@/components/forms";
import { Button } from "@/components/ui/button";
import { clientFormSchema, clientUpdateFormSchema } from "@/schema/client-form";

import { LogoUpload } from "./logo-upload";

type UserOption = {
  id: string;
  name: string;
  role: string | null;
};

type ClientFormProps = {
  mode: "create" | "edit";
  onSubmit: (values: Record<string, any>) => void;
  isPending: boolean;
  users?: UserOption[];
  defaultValues?: Record<string, any>;
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function ClientForm({
  mode,
  onSubmit,
  isPending,
  users = [],
  defaultValues,
}: ClientFormProps) {
  const [slugManuallyEdited] = useState(mode === "edit");
  const schema = mode === "create" ? clientFormSchema : clientUpdateFormSchema;

  function handleSubmit(values: Record<string, any>) {
    if (!slugManuallyEdited && values.name) {
      values.slug = slugify(values.name);
    }
    onSubmit(values);
  }

  return (
    <Form
      className="space-y-6"
      defaultValues={defaultValues as any}
      onSubmit={handleSubmit as any}
      schema={schema}
    >
      {({ watch, setValue }) => {
        const currentName = watch("name");
        if (!slugManuallyEdited && currentName !== undefined) {
          setValue("slug", slugify(currentName), { shouldValidate: false });
        }

        return (
          <>
            <SmartField name="name" />
            <SmartField name="legalName" />
            <SmartField
              name="logo"
              overrides={({ field }) => (
                <LogoUpload
                  onChange={(url: string | null) => field.onChange(url)}
                  value={field.value}
                />
              )}
            />
            <SmartField name="slug" />
            <SmartField name="locations" />
            <SmartField name="internalNotes" />
            {users.length > 0 && (
              <SmartField
                config={{
                  getOptionLabel: (o: UserOption) => o.name,
                  getOptionValue: (o: UserOption) => o.id,
                  options: users,
                  searchPlaceholder: "Search users...",
                }}
                name="assigneeId"
              />
            )}
            <div className="flex gap-3">
              <Button disabled={isPending} type="submit">
                {mode === "create" ? "Create Client" : "Save Changes"}
              </Button>
            </div>
          </>
        );
      }}
    </Form>
  );
}

export type { ClientFormProps, UserOption };
