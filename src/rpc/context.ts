import { os } from "@orpc/server";

import type { auth } from "@/lib/auth/server";
import type { SubordinateCache } from "@/services/supervisor-hierarchy-service";

export type AuthContext = {
  session: typeof auth.$Infer.Session.session;
  subordinateCache: SubordinateCache;
  user: typeof auth.$Infer.Session.user;
};

export const base = os.$context<{
  headers: HeadersInit | undefined;
}>();
