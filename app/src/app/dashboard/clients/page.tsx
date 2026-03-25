"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  SlidersHorizontal,
  UserRound,
  Mail,
  Phone,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  SlidePanel,
  FormSection,
  FormField,
  FormInput,
  FormTextarea,
  FormSelect,
  FormActions,
  PrimaryButton,
  SecondaryButton,
} from "@/components/dashboard/slide-panel";
import type { Client, Address } from "@/lib/types";
import { SERVICE_TYPES } from "@/lib/types";
import { toast } from "sonner";

const AVATAR_COLORS = [
  "bg-[#0071E3]/10 text-[#0071E3]",
  "bg-purple-500/10 text-purple-400",
  "bg-[#FF9F0A]/10 text-[#FF9F0A]",
  "bg-[#0071E3]/10 text-[#0071E3]",
  "bg-rose-500/10 text-rose-400",
];

function getInitials(first: string, last: string) {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

function getAvatarColor(index: number) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

function formatAddress(address: Address | undefined) {
  if (!address) return "";
  const parts = [address.street, address.city, address.state, address.zip].filter(Boolean);
  return parts.join(", ");
}

interface ClientWithMeta extends Client {
  addresses: Address[];
  jobs_count: number;
}

export default function ClientsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [clients, setClients] = useState<ClientWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "archived">("all");
  const [filterOpen, setFilterOpen] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [notes, setNotes] = useState("");
  const [preferredService, setPreferredService] = useState("");
  const [serviceTypes, setServiceTypes] = useState<string[]>([...SERVICE_TYPES]);

  useEffect(() => {
    async function loadServiceTypes() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("users").select("settings").eq("id", user.id).single();
      const biz = (((data?.settings || {}) as Record<string, unknown>).business || {}) as Record<string, unknown>;
      if (Array.isArray(biz.service_types) && biz.service_types.length > 0) {
        setServiceTypes(biz.service_types as string[]);
      }
    }
    loadServiceTypes();
  }, [supabase]);

  const fetchClients = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch clients
      const { data: clientsData, error: clientsError } = await supabase
        .from("clients")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (clientsError) throw clientsError;
      if (!clientsData) {
        setClients([]);
        return;
      }

      // Fetch addresses for all clients
      const clientIds = clientsData.map((c) => c.id);
      const { data: addressesData } = await supabase
        .from("addresses")
        .select("*")
        .in("client_id", clientIds.length > 0 ? clientIds : ["__none__"]);

      // Fetch job counts per client
      const { data: jobCounts } = await supabase
        .from("jobs")
        .select("client_id")
        .eq("user_id", user.id)
        .in("client_id", clientIds.length > 0 ? clientIds : ["__none__"]);

      const jobCountMap: Record<string, number> = {};
      jobCounts?.forEach((j) => {
        jobCountMap[j.client_id] = (jobCountMap[j.client_id] || 0) + 1;
      });

      const addressMap: Record<string, Address[]> = {};
      addressesData?.forEach((a) => {
        if (!addressMap[a.client_id]) addressMap[a.client_id] = [];
        addressMap[a.client_id].push(a as Address);
      });

      const enriched: ClientWithMeta[] = clientsData.map((c) => ({
        ...(c as Client),
        addresses: addressMap[c.id] || [],
        jobs_count: jobCountMap[c.id] || 0,
      }));

      setClients(enriched);
    } catch (err) {
      console.error("Error fetching clients:", err);
      toast.error("Failed to load clients");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setStreet("");
    setCity("");
    setState("");
    setZip("");
    setNotes("");
    setPreferredService("");
  };

  const openPanel = () => {
    resetForm();
    setPanelOpen(true);
  };

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("First name and last name are required");
      return;
    }
    if (!street.trim()) {
      toast.error("Street address is required");
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Insert client
      const { data: newClient, error: clientError } = await supabase
        .from("clients")
        .insert({
          user_id: user.id,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim() || null,
          phone: phone.trim() || null,
          preferred_service: preferredService || null,
          notes: notes.trim() || null,
          status: "active",
        })
        .select()
        .single();

      if (clientError) throw clientError;

      // Insert address
      const { error: addressError } = await supabase
        .from("addresses")
        .insert({
          client_id: newClient.id,
          user_id: user.id,
          street: street.trim(),
          city: city.trim() || null,
          state: state.trim() || null,
          zip: zip.trim() || null,
        });

      if (addressError) throw addressError;

      toast.success("Client added successfully");
      setPanelOpen(false);
      resetForm();
      await fetchClients();
    } catch (err) {
      console.error("Error saving client:", err);
      toast.error("Failed to save client");
    } finally {
      setSaving(false);
    }
  };

  const filtered = clients.filter((c) => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    const q = search.toLowerCase();
    const fullName = `${c.first_name} ${c.last_name}`.toLowerCase();
    return (
      fullName.includes(q) ||
      (c.email?.toLowerCase().includes(q) ?? false) ||
      (c.phone?.toLowerCase().includes(q) ?? false)
    );
  });

  const isEmpty = !loading && clients.length === 0;
  const noResults = !loading && clients.length > 0 && filtered.length === 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-[var(--mh-text-muted)] animate-pulse">
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[21px] font-semibold text-[var(--mh-text)] tracking-[-0.02em]">
            Clients
          </h1>
          <p className="text-[12.5px] text-[var(--mh-text-muted)] mt-0.5">
            Manage your client relationships
          </p>
        </div>
        <button
          onClick={openPanel}
          className="flex items-center gap-2 px-4 py-2 bg-[#0071E3] hover:bg-[#0071E3]/90 text-white text-[13px] font-semibold rounded-[6px] shadow-sm transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Client
        </button>
      </div>

      {/* Table card */}
      <div className="bg-[var(--mh-surface)] rounded-[6px] shadow-[0_1px_3px_rgba(0,0,0,0.4)] border border-[var(--mh-border)]">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--mh-divider)]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--mh-text-faint)]" />
            <input
              type="text"
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-[12.5px] bg-[var(--mh-surface-raised)] border border-[var(--mh-border)] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/50 focus:border-[#0071E3]/60 w-52 transition-all placeholder:text-[var(--mh-text-faint)] text-[var(--mh-text)]"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-[6px] transition-colors ${
                statusFilter !== "all"
                  ? "text-[var(--mh-text)] bg-[var(--mh-surface-raised)] border border-white/15"
                  : "text-[var(--mh-text-muted)] bg-[var(--mh-surface-raised)] border border-[var(--mh-border)] hover:bg-[var(--mh-hover-overlay)]"
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filter
              {statusFilter !== "all" && (
                <span className="h-1.5 w-1.5 rounded-full bg-[#0071E3]" />
              )}
            </button>
            {filterOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setFilterOpen(false)} />
                <div className="absolute right-0 top-full mt-1 w-36 bg-[var(--mh-surface)] rounded-[6px] shadow-[0_4px_16px_rgba(0,0,0,0.5)] border border-[var(--mh-border)] py-1 z-50">
                  {(["all", "active", "archived"] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => { setStatusFilter(opt); setFilterOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-[12px] font-medium transition-colors ${
                        statusFilter === opt ? "text-[var(--mh-text)] bg-[var(--mh-surface-raised)]" : "text-[var(--mh-text-muted)] hover:bg-[var(--mh-hover-overlay)]"
                      }`}
                    >
                      {opt === "all" ? "All Clients" : opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="h-12 w-12 rounded-[6px] bg-[#0071E3]/[0.12] flex items-center justify-center mb-3">
              <UserRound className="h-6 w-6 text-[#0071E3]" strokeWidth={1.5} />
            </div>
            <h3 className="text-[14px] font-semibold text-[var(--mh-text)] mb-1.5">
              No clients yet
            </h3>
            <p className="text-[12px] text-[var(--mh-text-muted)] mb-5 max-w-xs leading-relaxed">
              Keep track of your clients, their contact info, and job history all in one place.
            </p>
            <button
              onClick={openPanel}
              className="flex items-center gap-2 px-4 py-2 bg-[#0071E3] hover:bg-[#0071E3]/90 text-white text-[13px] font-semibold rounded-[6px] transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Client
            </button>
          </div>
        ) : noResults ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-[13px] font-semibold text-[var(--mh-text)]">
              No results for &ldquo;{search}&rdquo;
            </p>
            <p className="text-[12px] text-[var(--mh-text-muted)] mt-1">
              Try a different name, email, or phone number
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--mh-divider)]">
                  <th className="text-left px-5 py-3 text-[10.5px] font-semibold text-[var(--mh-text-subtle)] uppercase tracking-[0.06em]">
                    Name
                  </th>
                  <th className="text-left px-5 py-3 text-[10.5px] font-semibold text-[var(--mh-text-subtle)] uppercase tracking-[0.06em] hidden md:table-cell">
                    Email
                  </th>
                  <th className="text-left px-5 py-3 text-[10.5px] font-semibold text-[var(--mh-text-subtle)] uppercase tracking-[0.06em] hidden md:table-cell">
                    Phone
                  </th>
                  <th className="text-left px-5 py-3 text-[10.5px] font-semibold text-[var(--mh-text-subtle)] uppercase tracking-[0.06em] hidden lg:table-cell">
                    Address
                  </th>
                  <th className="text-left px-5 py-3 text-[10.5px] font-semibold text-[var(--mh-text-subtle)] uppercase tracking-[0.06em] hidden xl:table-cell">
                    Jobs
                  </th>
                  <th className="text-left px-5 py-3 text-[10.5px] font-semibold text-[var(--mh-text-subtle)] uppercase tracking-[0.06em]">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--mh-divider)]">
                {filtered.map((client, index) => {
                  const initials = getInitials(client.first_name, client.last_name);
                  const color = getAvatarColor(index);
                  const primaryAddress = client.addresses[0];
                  const statusBadge =
                    client.status === "active"
                      ? "bg-[#34C759]/10 text-[#34C759] ring-1 ring-inset ring-[#34C759]/20"
                      : "bg-[var(--mh-surface-raised)] text-[var(--mh-text-muted)] ring-1 ring-inset ring-[#2C2C2C]";

                  return (
                    <tr
                      key={client.id}
                      onClick={() => router.push(`/dashboard/clients/${client.id}`)}
                      className="hover:bg-[var(--mh-hover-overlay)] transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`h-7 w-7 rounded-full ${color} flex items-center justify-center text-[10px] font-bold shrink-0`}>
                            {initials}
                          </div>
                          <div>
                            <p className="text-[13px] font-semibold text-[var(--mh-text)]">
                              {client.first_name} {client.last_name}
                            </p>
                            <p className="text-[11px] text-[var(--mh-text-muted)] md:hidden">
                              {client.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-3 w-3 text-[var(--mh-text-faint)] shrink-0" />
                          <span className="text-[12px] text-[var(--mh-text-muted)]">
                            {client.email || "\u2014"}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3 w-3 text-[var(--mh-text-faint)] shrink-0" />
                          <span className="text-[12px] text-[var(--mh-text-muted)]">
                            {client.phone || "\u2014"}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[12px] text-[var(--mh-text-muted)] hidden lg:table-cell">
                        {formatAddress(primaryAddress) || "\u2014"}
                      </td>
                      <td className="px-5 py-3.5 hidden xl:table-cell">
                        <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-[var(--mh-hover-overlay)] text-[var(--mh-text)] text-[10px] font-bold">
                          {client.jobs_count}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${statusBadge}`}>
                          {client.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Client Slide Panel */}
      <SlidePanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        title="Add Client"
        subtitle="Add a new client to your roster"
        footer={
          <FormActions>
            <SecondaryButton onClick={() => setPanelOpen(false)}>
              Cancel
            </SecondaryButton>
            <PrimaryButton loading={saving} onClick={handleSave}>
              Save Client
            </PrimaryButton>
          </FormActions>
        }
      >
        <div className="px-6 py-6 space-y-6">
          <FormSection label="Contact Info">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="First Name" required>
                <FormInput
                  placeholder="Jane"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </FormField>
              <FormField label="Last Name" required>
                <FormInput
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </FormField>
            </div>
            <FormField label="Email">
              <FormInput
                type="email"
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormField>
            <FormField label="Phone">
              <FormInput
                type="tel"
                placeholder="(555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </FormField>
          </FormSection>

          <FormSection label="Service Preference">
            <FormField label="Preferred Service">
              <FormSelect
                value={preferredService}
                onChange={(e) => setPreferredService(e.target.value)}
              >
                <option value="">Select a service type...</option>
                {serviceTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </FormSelect>
            </FormField>
          </FormSection>

          <FormSection label="Service Address">
            <FormField label="Street" required>
              <FormInput
                placeholder="123 Main St, Apt 4B"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
              />
            </FormField>
            <div className="grid grid-cols-3 gap-3">
              <FormField label="City">
                <FormInput
                  placeholder="Brooklyn"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </FormField>
              <FormField label="State">
                <FormInput
                  placeholder="NY"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
              </FormField>
              <FormField label="ZIP">
                <FormInput
                  placeholder="11201"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                />
              </FormField>
            </div>
          </FormSection>

          <FormSection label="Notes">
            <FormField label="Notes">
              <FormTextarea
                rows={4}
                placeholder="Pet info, entry instructions, special requests..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </FormField>
          </FormSection>
        </div>
      </SlidePanel>
    </div>
  );
}
