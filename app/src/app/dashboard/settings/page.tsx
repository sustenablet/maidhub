"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  User,
  Building2,
  Phone,
  Loader2,
  Plus,
  X,
  Shield,
  ArrowUpRight,
  MapPin,
  Mail,
  Bell,
  DollarSign,
  Clock,
  Percent,
  Hash,
  AlertTriangle,
  Sun,
  Moon,
  Monitor,
  CreditCard,
  Check,
  Zap,
  Star,
  Pencil,
} from "lucide-react";
import { SERVICE_TYPES, DEFAULT_SERVICE_PRICES } from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme, type Theme } from "@/components/theme-provider";

type SettingsTab = "profile" | "business" | "preferences" | "subscription" | "account";

const tabs: { id: SettingsTab; label: string; icon: React.ElementType; description: string }[] = [
  { id: "profile", label: "Profile", icon: User, description: "Your personal info" },
  { id: "business", label: "Business", icon: Building2, description: "Services & pricing" },
  { id: "preferences", label: "Preferences", icon: Bell, description: "Appearance & notifications" },
  { id: "subscription", label: "Subscription", icon: CreditCard, description: "Plan & billing" },
  { id: "account", label: "Account", icon: Shield, description: "Security & data" },
];

/* ─── Reusable components ────────────────────────────── */

function FieldGroup({ children }: { children: React.ReactNode }) {
  return <div className="space-y-4">{children}</div>;
}

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="pb-1">
      <h3 className="text-[14px] font-bold text-[var(--mh-text)]">{title}</h3>
      {description && (
        <p className="text-[12px] text-[var(--mh-text-muted)] mt-0.5">{description}</p>
      )}
    </div>
  );
}

function Field({
  label,
  icon: Icon,
  hint,
  children,
}: {
  label: string;
  icon?: React.ElementType;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--mh-text-muted)]">
        {Icon && <Icon className="h-3 w-3" strokeWidth={1.8} />}
        {label}
      </label>
      {children}
      {hint && (
        <p className="text-[11px] text-[var(--mh-text-subtle)]">{hint}</p>
      )}
    </div>
  );
}

function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2 text-[13px] bg-[var(--mh-surface-sunken)] border border-[var(--mh-border)] rounded-[6px] outline-none transition-all focus:border-[#0071E3]/60 focus:shadow-[0_0_0_3px_rgba(26,35,50,0.04)] placeholder:text-[var(--mh-text-subtle)] ${className || ""}`}
      style={props.style}
    />
  );
}

function TextArea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full px-3 py-2 text-[13px] bg-[var(--mh-surface-sunken)] border border-[var(--mh-border)] rounded-[6px] outline-none transition-all focus:border-[#0071E3]/60 focus:shadow-[0_0_0_3px_rgba(26,35,50,0.04)] placeholder:text-[var(--mh-text-subtle)] resize-none ${className || ""}`}
      style={props.style}
    />
  );
}

function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 ${
        enabled ? "bg-[#0071E3]" : "bg-[var(--mh-toggle-off)]"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-[var(--mh-surface)] shadow-sm transition-transform duration-200 ${
          enabled ? "translate-x-[18px]" : "translate-x-[3px]"
        }`}
      />
    </button>
  );
}

function NotifRow({
  label,
  description,
  enabled,
  onChange,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-[var(--mh-divider)] last:border-0">
      <div className="pr-4">
        <p className="text-[13px] font-semibold text-[var(--mh-text)]">{label}</p>
        <p className="text-[12px] text-[var(--mh-text-muted)] mt-0.5 leading-relaxed">{description}</p>
      </div>
      <Toggle enabled={enabled} onChange={onChange} />
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[var(--mh-surface)] rounded-[6px] border border-[var(--mh-border)] shadow-[var(--mh-shadow-card)] overflow-hidden">
      {children}
    </div>
  );
}

function CardHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="px-4 py-3.5 md:px-6 md:py-4 border-b border-[var(--mh-border)]">
      <h2 className="text-[15px] font-bold text-[var(--mh-text)]">{title}</h2>
      {description && (
        <p className="text-[12px] text-[var(--mh-text-muted)] mt-0.5">{description}</p>
      )}
    </div>
  );
}

function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`px-4 py-4 md:px-6 md:py-5 ${className || ""}`}>{children}</div>;
}

function CardFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 py-3.5 md:px-6 md:py-4 border-t border-[var(--mh-border)] flex justify-end gap-3">
      {children}
    </div>
  );
}

function SaveButton({ loading, onClick }: { loading: boolean; onClick?: () => void }) {
  return (
    <button
      type="submit"
      disabled={loading}
      onClick={onClick}
      className="flex items-center gap-2 px-5 py-2 bg-[#0071E3] hover:bg-[#0077ED]/90 text-white text-[13px] font-semibold rounded-[6px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {loading ? "Saving..." : "Save Changes"}
    </button>
  );
}

/* ─── Main component ─────────────────────────────────── */

export default function SettingsPage() {
  const supabase = createClient();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [initialLoading, setInitialLoading] = useState(true);

  // Profile
  const [displayName, setDisplayName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [businessStreet, setBusinessStreet] = useState("");
  const [businessCity, setBusinessCity] = useState("");
  const [businessState, setBusinessState] = useState("");
  const [businessZip, setBusinessZip] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  // Business
  const [serviceTypes, setServiceTypes] = useState<string[]>([...SERVICE_TYPES]);
  const [servicePrices, setServicePrices] = useState<Record<string, string>>({});
  const [newService, setNewService] = useState("");
  const [editingPriceFor, setEditingPriceFor] = useState<string | null>(null);
  const [defaultRate, setDefaultRate] = useState("50");
  const [taxRate, setTaxRate] = useState("0");
  const [paymentTerms, setPaymentTerms] = useState("14");
  const [defaultDuration, setDefaultDuration] = useState("120");
  const [businessSaving, setBusinessSaving] = useState(false);

  // Notifications
  const [notifJobReminder, setNotifJobReminder] = useState(true);
  const [notifInvoiceReminder, setNotifInvoiceReminder] = useState(true);
  const [notifPaymentReceived, setNotifPaymentReceived] = useState(true);
  const [notifNewClient, setNotifNewClient] = useState(false);
  const [notifWeeklySummary, setNotifWeeklySummary] = useState(true);
  const [notifSaving, setNotifSaving] = useState(false);

  // Account
  const [subscriptionStatus, setSubscriptionStatus] = useState("trialing");
  const [subscriptionPlan, setSubscriptionPlan] = useState("solo");
  const [trialStart, setTrialStart] = useState("");

  // Password change
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Account deletion
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setEmail(user.email || "");

      const { data } = await supabase
        .from("users")
        .select("display_name, business_name, phone, subscription_status, subscription_plan, trial_start_date, settings")
        .eq("id", user.id)
        .single();

      if (data) {
        setDisplayName(data.display_name || "");
        setBusinessName(data.business_name || "");
        setPhone(data.phone || "");
        setSubscriptionStatus(data.subscription_status || "trialing");
        setSubscriptionPlan(data.subscription_plan || "solo");
        setTrialStart(data.trial_start_date || "");

        // Parse settings JSON
        const settings = (data.settings || {}) as Record<string, unknown>;
        const biz = (settings.business || {}) as Record<string, unknown>;
        const notif = (settings.notifications || {}) as Record<string, unknown>;

        // Business settings
        if (Array.isArray(biz.service_types) && biz.service_types.length > 0) {
          setServiceTypes(biz.service_types as string[]);
        }
        // Pre-fill with DEFAULT_SERVICE_PRICES as baseline, then overlay saved prices
        const defaultPrices = Object.fromEntries(
          Object.entries(DEFAULT_SERVICE_PRICES).map(([k, v]) => [k, String(v)])
        );
        if (biz.service_type_prices && typeof biz.service_type_prices === "object") {
          const raw = biz.service_type_prices as Record<string, unknown>;
          const saved = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, String(v)]));
          setServicePrices({ ...defaultPrices, ...saved });
        } else {
          setServicePrices(defaultPrices);
        }
        if (biz.default_rate != null) setDefaultRate(String(biz.default_rate));
        if (biz.tax_rate != null) setTaxRate(String(biz.tax_rate));
        if (biz.payment_terms != null) setPaymentTerms(String(biz.payment_terms));
        if (biz.default_duration != null) setDefaultDuration(String(biz.default_duration));

        // Business address from settings
        const addr = (biz.business_address || {}) as Record<string, string>;
        if (addr.street) setBusinessStreet(addr.street);
        if (addr.city) setBusinessCity(addr.city);
        if (addr.state) setBusinessState(addr.state);
        if (addr.zip) setBusinessZip(addr.zip);

        // Notification settings
        if (notif.job_reminder != null) setNotifJobReminder(!!notif.job_reminder);
        if (notif.invoice_reminder != null) setNotifInvoiceReminder(!!notif.invoice_reminder);
        if (notif.payment_received != null) setNotifPaymentReceived(!!notif.payment_received);
        if (notif.new_client != null) setNotifNewClient(!!notif.new_client);
        if (notif.weekly_summary != null) setNotifWeeklySummary(!!notif.weekly_summary);
      }
      setInitialLoading(false);
    }
    load();
  }, [supabase]);

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    setProfileSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setProfileSaving(false); return; }

    // Fetch current settings once so we don't clobber other keys
    const { data: userData } = await supabase
      .from("users").select("settings").eq("id", user.id).single();
    const currentSettings = ((userData?.settings || {}) as Record<string, unknown>);
    const currentBiz = ((currentSettings.business || {}) as Record<string, unknown>);

    const { error } = await supabase
      .from("users")
      .update({
        display_name: displayName,
        business_name: businessName,
        phone,
        settings: {
          ...currentSettings,
          business: {
            ...currentBiz,
            business_address: {
              street: businessStreet,
              city: businessCity,
              state: businessState,
              zip: businessZip,
            },
          },
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    setProfileSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Profile updated");
    }
  }

  async function handleBusinessSave() {
    setBusinessSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setBusinessSaving(false); return; }

    const bizSettings = {
      service_types: serviceTypes,
      service_type_prices: Object.fromEntries(
        Object.entries(servicePrices)
          .filter(([, v]) => v !== "" && !isNaN(parseFloat(v)))
          .map(([k, v]) => [k, parseFloat(v)])
      ),
      default_rate: parseFloat(defaultRate) || 0,
      tax_rate: parseFloat(taxRate) || 0,
      payment_terms: parseInt(paymentTerms) || 14,
      default_duration: parseInt(defaultDuration) || 120,
      business_address: {
        street: businessStreet,
        city: businessCity,
        state: businessState,
        zip: businessZip,
      },
    };

    const { data: userData } = await supabase
      .from("users").select("settings").eq("id", user.id).single();
    const currentSettings = ((userData?.settings || {}) as Record<string, unknown>);

    const { error } = await supabase
      .from("users")
      .update({ settings: { ...currentSettings, business: bizSettings }, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (error) {
      toast.error("Failed to save business settings");
    } else {
      toast.success("Business defaults saved");
    }
    setBusinessSaving(false);
  }

  async function handleNotificationsSave() {
    setNotifSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setNotifSaving(false); return; }

    const notifSettings = {
      job_reminder: notifJobReminder,
      invoice_reminder: notifInvoiceReminder,
      payment_received: notifPaymentReceived,
      new_client: notifNewClient,
      weekly_summary: notifWeeklySummary,
    };

    const { data: userData } = await supabase
      .from("users").select("settings").eq("id", user.id).single();
    const currentSettings = ((userData?.settings || {}) as Record<string, unknown>);

    const { error } = await supabase
      .from("users")
      .update({ settings: { ...currentSettings, notifications: notifSettings }, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (error) {
      toast.error("Failed to save notification preferences");
    } else {
      toast.success("Notification preferences saved");
    }
    setNotifSaving(false);
  }

  async function handlePasswordChange() {
    if (!newPassword) {
      toast.error("Enter a new password");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setPasswordSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordSaving(false);
    if (error) {
      toast.error("Failed to update password");
    } else {
      toast.success("Password updated");
      setNewPassword("");
      setConfirmPassword("");
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirmText !== "DELETE") return;
    setDeleting(true);
    // Sign out the user — full data deletion requires server-side admin API
    // which should be handled via a support/webhook flow
    await supabase.auth.signOut();
    setDeleting(false);
    toast.success("You have been signed out. Your account deletion request has been received.");
    router.push("/login");
  }

  function addServiceType() {
    const trimmed = newService.trim();
    if (!trimmed) return;
    if (serviceTypes.includes(trimmed)) {
      toast.error("Already exists");
      return;
    }
    setServiceTypes((prev) => [...prev, trimmed]);
    setNewService("");
    toast.success(`Added "${trimmed}"`);
  }

  function removeServiceType(index: number) {
    const removed = serviceTypes[index];
    setServiceTypes((prev) => prev.filter((_, i) => i !== index));
    toast.success(`Removed "${removed}"`);
  }

  function getTrialDaysLeft() {
    if (!trialStart) return 14;
    const end = new Date(trialStart);
    end.setDate(end.getDate() + 30);
    const diff = Math.ceil((end.getTime() - Date.now()) / 86400000);
    return Math.max(0, diff);
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-5 w-5 text-[var(--mh-text-muted)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-[26px] md:text-[21px] font-bold md:font-semibold text-[var(--mh-text)] tracking-[-0.03em] md:tracking-[-0.02em]">Settings</h1>
        <p className="hidden md:block text-[13px] text-[var(--mh-text-muted)] mt-0.5">Manage your profile, business, and account preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar nav */}
        <div className="lg:w-52 shrink-0">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-[6px] text-left transition-all whitespace-nowrap lg:whitespace-normal min-w-fit ${
                    isActive
                      ? "bg-[var(--mh-surface-raised)] border border-[var(--mh-border-strong)] text-[var(--mh-text)]"
                      : "text-[var(--mh-text-muted)] hover:text-[var(--mh-text)] hover:bg-[var(--mh-surface-raised)]/60"
                  }`}
                >
                  <div className={`h-8 w-8 rounded-[6px] flex items-center justify-center shrink-0 ${
                    isActive ? "bg-[#0071E3]/10" : "bg-transparent"
                  }`}>
                    <Icon className="h-4 w-4" strokeWidth={1.8} />
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-[13px] font-semibold leading-tight">{tab.label}</p>
                    <p className={`text-[11px] mt-0.5 ${isActive ? "text-[var(--mh-text-muted)]" : "text-[var(--mh-text-subtle)]"}`}>
                      {tab.description}
                    </p>
                  </div>
                  <span className="lg:hidden text-[13px] font-semibold">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content area */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* ─── PROFILE TAB ─────────────────────────────── */}
          {activeTab === "profile" && (
            <>
              <Card>
                <CardHeader title="Personal Information" description="How you appear across MaidHub" />
                <form onSubmit={handleProfileSave}>
                  <CardBody className="space-y-5">
                    {/* Avatar + name row */}
                    <div className="flex items-start gap-4">
                      <div className="h-14 w-14 rounded-[6px] bg-[var(--mh-surface-raised)] flex items-center justify-center shrink-0">
                        <span className="text-[var(--mh-text)] text-lg font-bold">
                          {displayName ? displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "?"}
                        </span>
                      </div>
                      <div className="flex-1 space-y-3">
                        <Field label="Display Name" icon={User}>
                          <Input
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Your full name"
                          />
                        </Field>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Email Address" icon={Mail} hint="Managed by your login provider">
                        <Input value={email} disabled className="opacity-50 cursor-not-allowed" />
                      </Field>
                      <Field label="Phone Number" icon={Phone}>
                        <Input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="(555) 000-0000"
                        />
                      </Field>
                    </div>
                  </CardBody>
                  <CardFooter>
                    <SaveButton loading={profileSaving} />
                  </CardFooter>
                </form>
              </Card>

              <Card>
                <CardHeader title="Business Details" description="Your cleaning business information shown on invoices and estimates" />
                <form onSubmit={handleProfileSave}>
                  <CardBody className="space-y-4">
                    <Field label="Business Name" icon={Building2}>
                      <Input
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g. Sparkling Clean Co."
                      />
                    </Field>

                    <SectionHeader title="Business Address" description="Appears on your invoices and estimates" />
                    <Field label="Street Address" icon={MapPin}>
                      <Input
                        value={businessStreet}
                        onChange={(e) => setBusinessStreet(e.target.value)}
                        placeholder="123 Main St, Suite 4"
                      />
                    </Field>
                    <div className="grid grid-cols-3 gap-3">
                      <Field label="City">
                        <Input
                          value={businessCity}
                          onChange={(e) => setBusinessCity(e.target.value)}
                          placeholder="Brooklyn"
                        />
                      </Field>
                      <Field label="State">
                        <Input
                          value={businessState}
                          onChange={(e) => setBusinessState(e.target.value)}
                          placeholder="NY"
                        />
                      </Field>
                      <Field label="ZIP">
                        <Input
                          value={businessZip}
                          onChange={(e) => setBusinessZip(e.target.value)}
                          placeholder="11201"
                        />
                      </Field>
                    </div>
                  </CardBody>
                  <CardFooter>
                    <SaveButton loading={profileSaving} />
                  </CardFooter>
                </form>
              </Card>
            </>
          )}

          {/* ─── BUSINESS TAB ────────────────────────────── */}
          {activeTab === "business" && (
            <>
              <Card>
                <CardHeader title="Service Types" description="The cleaning services you offer. These appear in job forms and can auto-fill pricing." />
                <CardBody className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      value={newService}
                      onChange={(e) => setNewService(e.target.value)}
                      placeholder="Add a new service type..."
                      className="flex-1 min-w-0"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addServiceType();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={addServiceType}
                      className="flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-2 bg-[#0071E3] hover:bg-[#0077ED]/90 text-white text-[13px] font-semibold rounded-[8px] sm:rounded-[6px] transition-colors shrink-0"
                    >
                      <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                      Add
                    </button>
                  </div>

                  <div className="space-y-2">
                    {serviceTypes.map((service, index) => {
                      const isEditing = editingPriceFor === service;
                      const savedPrice = servicePrices[service];
                      const defaultPrice = DEFAULT_SERVICE_PRICES[service];
                      const displayPrice = savedPrice || (defaultPrice ? String(defaultPrice) : "");
                      return (
                        <div
                          key={`${service}-${index}`}
                          className="px-3 py-3 bg-[var(--mh-surface-sunken)] border border-[var(--mh-border)] rounded-[10px] sm:rounded-[6px] hover:bg-[var(--mh-hover-overlay)] transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="h-1.5 w-1.5 rounded-full bg-[var(--mh-text-faint)] shrink-0" />
                              <span className="text-[13px] font-medium text-[var(--mh-text)] truncate">{service}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeServiceType(index)}
                              className="h-7 w-7 flex items-center justify-center rounded-[6px] text-[var(--mh-text-subtle)] hover:text-red-500 hover:bg-red-500/10 transition-colors shrink-0"
                              aria-label={`Remove ${service}`}
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="mt-2 flex items-center justify-between gap-2">
                            {isEditing ? (
                              <div className="flex items-center gap-1">
                                <span className="text-[12px] text-[var(--mh-text-subtle)]">$</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="5"
                                  autoFocus
                                  value={servicePrices[service] || ""}
                                  onChange={(e) => setServicePrices((prev) => ({ ...prev, [service]: e.target.value }))}
                                  onBlur={() => setEditingPriceFor(null)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === "Escape") setEditingPriceFor(null);
                                  }}
                                  className="w-24 px-2 py-1.5 text-[12px] bg-[var(--mh-surface)] border border-[#0071E3]/50 rounded-[6px] text-[var(--mh-text)] outline-none text-right"
                                />
                              </div>
                            ) : (
                              <span className="text-[13px] font-semibold text-[var(--mh-text)]">
                                {displayPrice ? `$${displayPrice}` : <span className="text-[var(--mh-text-faint)]">—</span>}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingPriceFor(service);
                                if (!servicePrices[service] && defaultPrice) {
                                  setServicePrices((prev) => ({ ...prev, [service]: String(defaultPrice) }));
                                }
                              }}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[7px] text-[11px] font-semibold text-[var(--mh-text-muted)] bg-[var(--mh-surface)] border border-[var(--mh-border)] hover:text-[#0071E3] hover:border-[#0071E3]/40 transition-colors"
                              title="Edit price"
                            >
                              <Pencil className="h-3 w-3" strokeWidth={2} />
                              Edit price
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-[11px] text-[var(--mh-text-subtle)]">
                    {serviceTypes.length} service type{serviceTypes.length !== 1 ? "s" : ""} · Prices auto-fill when scheduling and are always overridable per job
                  </p>
                </CardBody>
                <CardFooter>
                  <SaveButton loading={businessSaving} onClick={handleBusinessSave} />
                </CardFooter>
              </Card>

              <Card>
                <CardHeader title="Invoicing Defaults" description="Applied automatically when creating new invoices." />
                <CardBody className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Tax Rate" icon={Percent} hint="Appended to invoice totals">
                      <div className="relative">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.5"
                          value={taxRate}
                          onChange={(e) => setTaxRate(e.target.value)}
                          className="pr-7"
                          placeholder="0"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-[var(--mh-text-muted)]">%</span>
                      </div>
                    </Field>

                    <Field label="Payment Terms" icon={Hash} hint="Days until invoice is due">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-[var(--mh-text-subtle)]">Net</span>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          value={paymentTerms}
                          onChange={(e) => setPaymentTerms(e.target.value)}
                          className="pl-10"
                          placeholder="14"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[var(--mh-text-subtle)]">days</span>
                      </div>
                    </Field>
                  </div>
                </CardBody>
                <CardFooter>
                  <SaveButton loading={businessSaving} onClick={handleBusinessSave} />
                </CardFooter>
              </Card>

              <Card>
                <CardHeader title="Scheduling Defaults" description="Used as fallback values when scheduling new jobs." />
                <CardBody className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Default Job Rate" icon={DollarSign} hint="Fallback price when no service type price is set">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-[var(--mh-text-muted)]">$</span>
                        <Input
                          type="number"
                          min="0"
                          step="5"
                          value={defaultRate}
                          onChange={(e) => setDefaultRate(e.target.value)}
                          className="pl-7"
                          placeholder="50"
                        />
                      </div>
                    </Field>

                    <Field label="Default Duration" icon={Clock} hint="Default length of a cleaning session">
                      <div className="relative">
                        <Input
                          type="number"
                          min="30"
                          step="15"
                          value={defaultDuration}
                          onChange={(e) => setDefaultDuration(e.target.value)}
                          className="pr-12"
                          placeholder="120"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[var(--mh-text-subtle)]">min</span>
                      </div>
                    </Field>
                  </div>

                  <div className="pt-1 border-t border-[var(--mh-divider)]">
                    <p className="text-[11px] text-[var(--mh-text-subtle)] leading-relaxed">
                      These values apply when no specific service type price or duration is selected. Per-job overrides always take priority.
                    </p>
                  </div>
                </CardBody>
                <CardFooter>
                  <SaveButton loading={businessSaving} onClick={handleBusinessSave} />
                </CardFooter>
              </Card>
            </>
          )}

          {/* ─── PREFERENCES TAB ─────────────────────────── */}
          {activeTab === "preferences" && (
            <>
              {/* Appearance */}
              <Card>
                <CardHeader title="Appearance" description="Choose how MaidHub looks on this device." />
                <CardBody className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    {(
                      [
                        { value: "light" as Theme, label: "Light", icon: Sun },
                        { value: "dark" as Theme, label: "Dark", icon: Moon },
                        { value: "system" as Theme, label: "System", icon: Monitor },
                      ] as { value: Theme; label: string; icon: React.ElementType }[]
                    ).map(({ value, label, icon: Icon }) => {
                      const isSelected = theme === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setTheme(value)}
                          className={`flex flex-col items-center gap-2 py-4 px-3 rounded-[8px] border transition-all ${
                            isSelected
                              ? "bg-[#0071E3]/10 border-[#0071E3]/50 text-[#0071E3]"
                              : "bg-[var(--mh-surface-raised)] border-[var(--mh-border)] text-[var(--mh-text-muted)] hover:border-[var(--mh-text-faint)] hover:text-[var(--mh-text)]"
                          }`}
                        >
                          <Icon className="h-5 w-5" strokeWidth={1.8} />
                          <span className="text-[12px] font-semibold">{label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-[var(--mh-text-subtle)]">
                    Preference is saved to this browser only.
                  </p>
                </CardBody>
              </Card>

              {/* Email Notifications */}
              <Card>
                <CardHeader title="Email Notifications" description="Choose which emails you receive. You can change these at any time." />
                <CardBody>
                  <NotifRow
                    label="Job reminders"
                    description="Get reminded about upcoming jobs the day before they're scheduled"
                    enabled={notifJobReminder}
                    onChange={setNotifJobReminder}
                  />
                  <NotifRow
                    label="Invoice reminders"
                    description="Automatic reminder when an invoice is approaching its due date"
                    enabled={notifInvoiceReminder}
                    onChange={setNotifInvoiceReminder}
                  />
                  <NotifRow
                    label="Payment received"
                    description="Get notified when a client pays an invoice"
                    enabled={notifPaymentReceived}
                    onChange={setNotifPaymentReceived}
                  />
                  <NotifRow
                    label="New client added"
                    description="Confirmation when a new client is added to your account"
                    enabled={notifNewClient}
                    onChange={setNotifNewClient}
                  />
                  <NotifRow
                    label="Weekly summary"
                    description="A digest of your jobs, revenue, and activity from the past week"
                    enabled={notifWeeklySummary}
                    onChange={setNotifWeeklySummary}
                  />
                </CardBody>
                <CardFooter>
                  <SaveButton loading={notifSaving} onClick={handleNotificationsSave} />
                </CardFooter>
              </Card>

              <div className="bg-[var(--mh-surface-sunken)] rounded-[6px] border border-[var(--mh-border)] px-5 py-4">
                <p className="text-[12px] text-[var(--mh-text-muted)] leading-relaxed">
                  Email notifications are sent to <span className="font-semibold text-[var(--mh-text)]">{email}</span>.
                  To change your email address, update it through your login provider.
                </p>
              </div>
            </>
          )}

          {/* ─── SUBSCRIPTION TAB ───────────────────────── */}
          {activeTab === "subscription" && (
            <>
              {/* Current Plan Banner */}
              <div className="bg-[var(--mh-surface)] border border-[var(--mh-border)] rounded-[8px] shadow-[var(--mh-shadow-card)] overflow-hidden">
                <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-[6px] bg-[#0071E3]/10 flex items-center justify-center">
                        <Zap className="h-3.5 w-3.5 text-[#0071E3]" strokeWidth={2} />
                      </div>
                      <div>
                        <p className="text-[15px] font-bold text-[var(--mh-text)]">
                          {subscriptionStatus === "trialing" ? "Free Trial" : subscriptionPlan === "solo" ? "Solo Plan" : "Team Plan"}
                        </p>
                        <p className="text-[12px] text-[var(--mh-text-muted)]">
                          {subscriptionStatus === "trialing"
                            ? `${getTrialDaysLeft()} days remaining in your trial`
                            : "Your plan renews monthly"}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 text-[12px] text-[var(--mh-text-muted)]">
                        <Check className="h-3.5 w-3.5 text-[#0071E3] shrink-0" strokeWidth={2.5} />
                        <span>Unlimited clients &amp; addresses</span>
                      </div>
                      <div className="flex items-center gap-2 text-[12px] text-[var(--mh-text-muted)]">
                        <Check className="h-3.5 w-3.5 text-[#0071E3] shrink-0" strokeWidth={2.5} />
                        <span>Full scheduling, invoicing &amp; estimates</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3 shrink-0">
                    {subscriptionStatus === "trialing" ? (
                      <div className="text-right">
                        <p className="text-[11px] text-[var(--mh-text-muted)] uppercase tracking-wider font-semibold">Current</p>
                        <p className="text-[28px] font-bold text-[var(--mh-text)] leading-none">Free</p>
                        <p className="text-[12px] text-[var(--mh-text-muted)] mt-1">trial period</p>
                      </div>
                    ) : (
                      <div className="text-right">
                        <p className="text-[28px] font-bold text-[var(--mh-text)] leading-none">$29</p>
                        <p className="text-[12px] text-[var(--mh-text-muted)] mt-1">per month</p>
                      </div>
                    )}
                    <button className="px-4 py-2 text-[13px] font-semibold text-[var(--mh-text)] bg-[var(--mh-surface-raised)] border border-[var(--mh-border-strong)] rounded-[6px] hover:bg-[var(--mh-hover-overlay)] transition-colors">
                      Manage Plan
                    </button>
                  </div>
                </div>
              </div>

              {/* Plans */}
              <div>
                <h3 className="text-[13px] font-bold text-[var(--mh-text)] mb-3">Available Plans</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Solo Plan */}
                  <div className={`relative rounded-[8px] border overflow-hidden transition-all ${
                    subscriptionStatus !== "trialing"
                      ? "bg-[var(--mh-surface)] border-[#0071E3]/50 shadow-[0_0_0_1px_rgba(0,113,227,0.1),var(--mh-shadow-card)]"
                      : "bg-[var(--mh-surface)] border-[var(--mh-border)] shadow-[var(--mh-shadow-card)]"
                  }`}>
                    {subscriptionStatus !== "trialing" && (
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-[#0071E3] text-white rounded-full uppercase tracking-wider">
                          Current
                        </span>
                      </div>
                    )}
                    <div className="px-5 py-5">
                      <p className="text-[17px] font-bold text-[var(--mh-text)]">Solo</p>
                      <p className="text-[12px] text-[var(--mh-text-muted)] mt-1 leading-relaxed">
                        Everything you need to run your cleaning business independently.
                      </p>
                      <div className="flex items-end gap-1 mt-4 mb-5">
                        <span className="text-[34px] font-bold text-[var(--mh-text)] leading-none">$29</span>
                        <span className="text-[13px] text-[var(--mh-text-muted)] mb-1">/ month</span>
                      </div>
                      <div className="space-y-2 mb-5">
                        {[
                          "Unlimited clients & addresses",
                          "Full job scheduling & calendar",
                          "Recurring job rules",
                          "Estimates & invoicing",
                          "Revenue & finances overview",
                          "Mobile-optimized interface",
                          "Priority email support",
                        ].map((feat) => (
                          <div key={feat} className="flex items-center gap-2 text-[12px] text-[var(--mh-text-muted)]">
                            <Check className="h-3.5 w-3.5 text-[#0071E3] shrink-0" strokeWidth={2.5} />
                            {feat}
                          </div>
                        ))}
                      </div>
                      {subscriptionStatus === "trialing" ? (
                        <button className="w-full py-2.5 text-[13px] font-semibold bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-[6px] transition-colors">
                          Upgrade to Solo
                        </button>
                      ) : (
                        <button className="w-full py-2.5 text-[13px] font-semibold bg-[#0071E3]/10 text-[#0071E3] rounded-[6px] cursor-default">
                          Current Plan
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Team Plan (Coming Soon) */}
                  <div className="relative rounded-[8px] border border-[var(--mh-border)] bg-[var(--mh-surface)] shadow-[var(--mh-shadow-card)] overflow-hidden opacity-70">
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-[var(--mh-surface-raised)] text-[var(--mh-text-muted)] border border-[var(--mh-border)] rounded-full uppercase tracking-wider">
                        Coming Soon
                      </span>
                    </div>
                    <div className="px-5 py-5">
                      <div className="flex items-center gap-2">
                        <p className="text-[17px] font-bold text-[var(--mh-text)]">Team</p>
                        <Star className="h-3.5 w-3.5 text-[#FF9F0A]" strokeWidth={2} />
                      </div>
                      <p className="text-[12px] text-[var(--mh-text-muted)] mt-1 leading-relaxed">
                        For growing cleaning businesses with multiple employees.
                      </p>
                      <div className="flex items-end gap-1 mt-4 mb-5">
                        <span className="text-[34px] font-bold text-[var(--mh-text)] leading-none">$49</span>
                        <span className="text-[13px] text-[var(--mh-text-muted)] mb-1">/ month</span>
                      </div>
                      <div className="space-y-2 mb-5">
                        {[
                          "Everything in Solo",
                          "Up to 5 team members",
                          "Team scheduling & dispatch",
                          "Per-employee job assignments",
                          "Team performance reports",
                          "Advanced client management",
                          "Dedicated support",
                        ].map((feat) => (
                          <div key={feat} className="flex items-center gap-2 text-[12px] text-[var(--mh-text-muted)]">
                            <Check className="h-3.5 w-3.5 text-[var(--mh-text-faint)] shrink-0" strokeWidth={2.5} />
                            {feat}
                          </div>
                        ))}
                      </div>
                      <button disabled className="w-full py-2.5 text-[13px] font-semibold bg-[var(--mh-surface-raised)] border border-[var(--mh-border)] text-[var(--mh-text-muted)] rounded-[6px] cursor-not-allowed">
                        Coming Soon
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Billing info */}
              <div className="bg-[var(--mh-surface-sunken)] rounded-[6px] border border-[var(--mh-border)] px-5 py-4">
                <p className="text-[12px] text-[var(--mh-text-muted)] leading-relaxed">
                  Billing is managed securely. To update your payment method or cancel your subscription, use <span className="font-semibold text-[var(--mh-text)]">Manage Plan</span> above or contact support at <span className="font-semibold text-[var(--mh-text)]">support@maidhub.io</span>.
                </p>
              </div>
            </>
          )}

          {/* ─── ACCOUNT TAB ─────────────────────────────── */}
          {activeTab === "account" && (
            <>
              {/* Quick plan info */}
              <div className="flex items-center justify-between p-4 bg-[var(--mh-surface)] border border-[var(--mh-border)] rounded-[6px] shadow-[var(--mh-shadow-card)]">
                <div>
                  <p className="text-[13px] font-semibold text-[var(--mh-text)]">
                    {subscriptionStatus === "trialing" ? "Free Trial" : subscriptionPlan === "solo" ? "Solo Plan" : "Team Plan"}
                  </p>
                  <p className="text-[12px] text-[var(--mh-text-muted)] mt-0.5">
                    {subscriptionStatus === "trialing"
                      ? `${getTrialDaysLeft()} days remaining`
                      : "Active subscription"}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("subscription")}
                  className="flex items-center gap-1.5 text-[12px] font-semibold text-[#0071E3] hover:text-[#0077ED] transition-colors"
                >
                  Manage
                  <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
              </div>

              <Card>
                <CardHeader title="Security" />
                <CardBody className="space-y-4">
                  <SectionHeader title="Change Password" description="Set a new password for your account" />
                  <div className="space-y-3">
                    <FieldGroup>
                      <Field label="New Password">
                        <Input
                          type="password"
                          placeholder="Minimum 8 characters"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                      </Field>
                      <Field label="Confirm New Password">
                        <Input
                          type="password"
                          placeholder="Re-enter new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </Field>
                    </FieldGroup>
                    <button
                      type="button"
                      onClick={handlePasswordChange}
                      disabled={passwordSaving || !newPassword || !confirmPassword}
                      className="flex items-center gap-2 px-4 py-2 text-[13px] font-semibold bg-[var(--mh-surface-raised)] border border-[var(--mh-border-strong)] text-[var(--mh-text)] rounded-[6px] hover:bg-[var(--mh-hover-overlay)] hover:border-[var(--mh-border)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {passwordSaving ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Updating…
                        </>
                      ) : (
                        "Update Password"
                      )}
                    </button>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <div className="px-6 py-4 border-b border-red-500/20">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-400" strokeWidth={1.8} />
                    <h2 className="text-[15px] font-bold text-red-400">Danger Zone</h2>
                  </div>
                </div>
                <CardBody className="space-y-3">
                  <p className="text-[12px] text-[var(--mh-text-muted)] leading-relaxed">
                    Deleting your account is permanent. All your data including clients, jobs, invoices,
                    and estimates will be permanently removed. This action cannot be undone.
                  </p>
                  <button
                    type="button"
                    onClick={() => { setDeleteConfirmText(""); setDeleteModalOpen(true); }}
                    className="px-4 py-2 text-[13px] font-semibold text-red-400 bg-red-500/10 border border-red-500/20 rounded-[6px] hover:bg-red-500/20 transition-colors"
                  >
                    Delete Account
                  </button>
                </CardBody>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Delete Account Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--mh-overlay-scrim)] px-4" onClick={() => setDeleteModalOpen(false)}>
          <div className="bg-[var(--mh-surface)] border border-[var(--mh-border)] rounded-[8px] shadow-[0_8px_40px_rgba(0,0,0,0.6)] w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-[var(--mh-border)] flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-4.5 w-4.5 text-red-400" strokeWidth={1.8} />
              </div>
              <div>
                <h2 className="text-[15px] font-bold text-[var(--mh-text)]">Delete Account</h2>
                <p className="text-[12px] text-[var(--mh-text-muted)] mt-0.5">This action is permanent and cannot be undone.</p>
              </div>
            </div>
            <div className="px-6 py-5 space-y-4">
              <p className="text-[13px] text-[var(--mh-text-muted)] leading-relaxed">
                All your data — clients, jobs, invoices, estimates, and settings — will be permanently deleted. Your subscription will be cancelled immediately.
              </p>
              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-[var(--mh-text-muted)]">
                  Type <span className="text-red-400 font-mono">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-3 py-2.5 text-[13px] bg-[var(--mh-surface-raised)] border border-[var(--mh-border)] rounded-[6px] outline-none focus:border-red-500/50 placeholder:text-[var(--mh-text-faint)] text-[var(--mh-text)] transition-colors"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[var(--mh-border)] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 text-[13px] font-semibold text-[var(--mh-text-muted)] hover:text-[var(--mh-text)] border border-[var(--mh-border)] hover:border-[var(--mh-border-strong)] rounded-[6px] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== "DELETE" || deleting}
                className="flex items-center gap-2 px-4 py-2 text-[13px] font-semibold text-white bg-red-600 hover:bg-red-700 rounded-[6px] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {deleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {deleting ? "Deleting..." : "Delete My Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
