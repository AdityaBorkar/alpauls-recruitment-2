import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(protected)/(app)/audit-log")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      PENDING
    </div>
  );
}
