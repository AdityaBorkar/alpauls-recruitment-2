import { zodResolver } from "@hookform/resolvers/zod";
import { useId } from "react";
import type { FieldErrors } from "react-hook-form";
import { FormProvider, useForm } from "react-hook-form";
import type { z } from "zod";

import { FormContext } from "./form-context";
import { buildDefaults, buildFieldMap } from "./use-schema-form";

export type ValidationMode = "onBlur" | "onChange" | "onSubmit" | "all";

export type FormProps<T extends z.ZodObject<any>> = {
  schema: T;
  onSubmit: (values: Record<string, any>) => void;
  onInvalid?: (errors: FieldErrors) => void;
  defaultValues?: Record<string, any>;
  validationMode?: ValidationMode;
  className?: string;
  children: (methods: ReturnType<typeof useForm>) => React.ReactNode;
  ref?: React.Ref<any>;
};

export function Form<T extends z.ZodObject<any>>({
  schema,
  onSubmit,
  onInvalid,
  defaultValues: defaultValuesProp,
  validationMode = "onBlur",
  className,
  children,
  ref,
}: FormProps<T>) {
  const uid = useId();
  const fieldMap = buildFieldMap(schema);
  const schemaDefaults = buildDefaults(schema, defaultValuesProp);

  const methods = useForm({
    defaultValues: schemaDefaults as any,
    mode: validationMode,
    resolver: zodResolver(schema),
    reValidateMode: "onChange",
  });

  if (ref) {
    (ref as React.MutableRefObject<any>).current = methods;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    methods.handleSubmit((values) => {
      const parsed = schema.parse(values);
      onSubmit(parsed as Record<string, any>);
    }, onInvalid as any)();
  }

  return (
    <FormContext value={{ fieldMap, formId: uid }}>
      <FormProvider {...methods}>
        <form className={className} onSubmit={handleSubmit}>
          {children(methods)}
        </form>
      </FormProvider>
    </FormContext>
  );
}
