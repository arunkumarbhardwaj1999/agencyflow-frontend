"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { Member } from "@/lib/types";

export function useMembers() {
  return useQuery({
    queryKey: ["members"],
    queryFn: () => apiFetch<Member[]>("/users/members"),
    staleTime: 60_000,
  });
}
