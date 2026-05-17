import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(protected)/(app)/(phase-2)/email")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      To Be Implemented in Phase 2
    </div>
  );
}
