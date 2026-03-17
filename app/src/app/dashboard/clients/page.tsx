"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  SlidersHorizontal,
  MoreHorizontal,
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
  FormActions,
  PrimaryButton,
  SecondaryButton,
} from "@/components/dashboard/slide-panel";
import type { Client, Address } from "@/lib/types";
import { toast } from "sonner";

const AVATAR_COLORS = [
  "bg-teal-100 text-teal-700",
  "bg-purple-100 text-purple-700",
  "bg-amber-100 text-amber-700",
  "bg-blue-100 text-blue-700",
  "bg-rose-100 text-rose-700",
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
        <p
          className="text-sm text-gray-400 animate-pulse"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
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
          <h1
            className="text-2xl font-bold text-[#1A2332]"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Clients
          </h1>
          <p
            className="text-sm text-gray-400 mt-0.5"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Manage your client relationships
          </p>
        </div>
        <button
          onClick={openPanel}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          <Plus className="h-4 w-4" />
          Add Client
        </button>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-350" />
            <input
              type="text"
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-300 w-52 transition-all"
              style={{ fontFamily: "'Syne', sans-serif" }}
            />
          </div>
          <button
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#1A2332]/55 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filter
          </button>
        </div>

        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="h-16 w-16 rounded-2xl bg-teal-50 flex items-center justify-center mb-4">
              <UserRound className="h-8 w-8 text-teal-400" />
            </div>
            <h3
              className="text-base font-semibold text-[#1A2332] mb-2"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              No clients yet
            </h3>
            <p
              className="text-sm text-gray-400 mb-6 max-w-xs leading-relaxed"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Keep track of your clients, their contact info, and job history all
              in one place.
            </p>
            <button
              onClick={openPanel}
              className="flex items-center gap-2 px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-xl transition-colors"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              <Plus className="h-4 w-4" />
              Add Client
            </button>
          </div>
        ) : noResults ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p
              className="text-sm font-semibold text-[#1A2332]"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              No results for &ldquo;{search}&rdquo;
            </p>
            <p
              className="text-xs text-gray-400 mt-1"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Try a different name, email, or phone number
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th
                    className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    Name
                  </th>
                  <th
                    className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 hidden md:table-cell"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    Email
                  </th>
                  <th
                    className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 hidden md:table-cell"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    Phone
                  </th>
                  <th
                    className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 hidden lg:table-cell"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    Address
                  </th>
                  <th
                    className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 hidden xl:table-cell"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    Jobs
                  </th>
                  <th
                    className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    Status
                  </th>
                  <th className="px-5 py-3 w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((client, index) => {
                  const initials = getInitials(client.first_name, client.last_name);
                  const color = getAvatarColor(index);
                  const primaryAddress = client.addresses[0];
                  const statusBadge =
                    client.status === "active"
                      ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-200"
                      : "bg-gray-50 text-gray-500 ring-1 ring-inset ring-gray-200";

                  return (
                    <tr
                      key={client.id}
                      onClick={() => router.push(`/dashboard/clients/${client.id}`)}
                      className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-8 w-8 rounded-full ${color} flex items-center justify-center text-xs font-bold shrink-0`}
                            style={{ fontFamily: "'Syne', sans-serif" }}
                          >
                            {initials}
                          </div>
                          <div>
                            <p
                              className="text-sm font-semibold text-[#1A2332]"
                              style={{ fontFamily: "'Syne', sans-serif" }}
                            >
                              {client.first_name} {client.last_name}
                            </p>
                            <p className="text-xs text-gray-400 md:hidden">
                              {client.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-3 w-3 text-gray-300 shrink-0" />
                          <span
                            className="text-xs text-[#1A2332]/60"
                            style={{ fontFamily: "'Syne', sans-serif" }}
                          >
                            {client.email || "\u2014"}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3 w-3 text-gray-300 shrink-0" />
                          <span
                            className="text-xs text-[#1A2332]/60"
                            style={{ fontFamily: "'Syne', sans-serif" }}
                          >
                            {client.phone || "\u2014"}
                          </span>
                        </div>
                      </td>
                      <td
                        className="px-5 py-4 text-xs text-[#1A2332]/55 hidden lg:table-cell"
                        style={{ fontFamily: "'Syne', sans-serif" }}
                      >
                        {formatAddress(primaryAddress) || "\u2014"}
                      </td>
                      <td className="px-5 py-4 hidden xl:table-cell">
                        <span
                          className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-teal-50 text-teal-700 text-xs font-bold"
                          style={{ fontFamily: "'Syne', sans-serif" }}
                        >
                          {client.jobs_count}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold capitalize ${statusBadge}`}
                          style={{ fontFamily: "'Syne', sans-serif" }}
                        >
                          {client.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="text-gray-300 hover:text-gray-500 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
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

        <FormActions>
          <SecondaryButton onClick={() => setPanelOpen(false)}>
            Cancel
          </SecondaryButton>
          <PrimaryButton loading={saving} onClick={handleSave}>
            Save Client
          </PrimaryButton>
        </FormActions>
      </SlidePanel>
    </div>
  );
}
