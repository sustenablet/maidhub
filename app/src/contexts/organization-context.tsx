"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

export interface Organization {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

interface OrgContextValue {
  organizations: Organization[];
  currentOrg: Organization | null;
  currentOrgId: string | null;
  switchOrg: (id: string) => void;
  createOrg: (name: string, phone?: string) => Promise<Organization>;
  refreshOrgs: () => Promise<void>;
  loading: boolean;
}

const OrgContext = createContext<OrgContextValue | null>(null);

const COOKIE_NAME = "mh_org_id";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
}

export function OrganizationProvider({
  children,
  userId,
}: {
  children: React.ReactNode;
  userId: string;
}) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);
  const userIdRef = useRef(userId);

  const loadOrgs = useCallback(async () => {
    const { data } = await supabase
      .from("organizations")
      .select("*")
      .eq("user_id", userIdRef.current)
      .order("created_at", { ascending: true });

    if (data && data.length > 0) {
      setOrganizations(data as Organization[]);
      const stored = getCookie(COOKIE_NAME);
      const valid = stored && data.find((o) => o.id === stored);
      const chosen = valid ? stored : data[0].id;
      setCurrentOrgId(chosen);
      setCookie(COOKIE_NAME, chosen);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadOrgs();
  }, [loadOrgs]);

  const switchOrg = useCallback((id: string) => {
    setCurrentOrgId(id);
    setCookie(COOKIE_NAME, id);
  }, []);

  const createOrg = useCallback(
    async (name: string, phone?: string): Promise<Organization> => {
      const { data, error } = await supabase
        .from("organizations")
        .insert({ user_id: userIdRef.current, name, phone: phone || null, settings: {} })
        .select()
        .single();
      if (error) {
        console.error("[createOrg] Supabase error:", error);
        throw error;
      }
      const org = data as Organization;
      setOrganizations((prev) => [...prev, org]);
      switchOrg(org.id);
      return org;
    },
    [supabase, switchOrg]
  );

  const currentOrg = organizations.find((o) => o.id === currentOrgId) || null;

  return (
    <OrgContext.Provider
      value={{ organizations, currentOrg, currentOrgId, switchOrg, createOrg, refreshOrgs: loadOrgs, loading }}
    >
      {children}
    </OrgContext.Provider>
  );
}

export function useOrganization() {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error("useOrganization must be used within OrganizationProvider");
  return ctx;
}
