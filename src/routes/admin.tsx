import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState, useEffect } from "react";
import { teamDb } from "../lib/db";
import { LeadsView } from "../components/LeadsView";

// Server functions for admin data
const getAdminData = createServerFn({ method: "GET" }).handler(async () => {
  const users = await teamDb("SELECT * FROM users ORDER BY created_at DESC");
  const transactions = await teamDb("SELECT t.*, u.email FROM transactions t JOIN users u ON t.user_id = u.id ORDER BY t.created_at DESC");
  const cars = await teamDb("SELECT * FROM cars ORDER BY created_at DESC");
  const valuations = await teamDb("SELECT * FROM valuations");
  const assets = await teamDb("SELECT a.*, u.email FROM assets a JOIN users u ON a.user_id = u.id ORDER BY a.created_at DESC");
  const inspections = await teamDb("SELECT i.*, u.email FROM inspections i JOIN users u ON i.user_id = u.id ORDER BY i.created_at DESC");
  const deals = await teamDb("SELECT * FROM deals ORDER BY created_at DESC");
  const orders = await teamDb("SELECT * FROM orders ORDER BY created_at DESC");
  const notifications = await teamDb("SELECT * FROM notifications ORDER BY created_at DESC");

  const totalUsers = users.length;
  const totalRevenue = transactions.reduce((acc: number, t: any) => acc + (t.amount_cents || 0), 0) / 100;
  const activeListings = cars.filter((c: any) => c.status === 'available').length;
  
  // Valuation conversion rate: % of users who have at least one valuation
  const usersWithValuations = new Set(valuations.map((v: any) => v.user_id)).size;
  const valuationConversionRate = totalUsers > 0 ? (usersWithValuations / totalUsers) * 100 : 0;

  // Tier breakdown
  const tierBreakdown = users.reduce((acc: any, u: any) => {
    acc[u.tier] = (acc[u.tier] || 0) + 1;
    return acc;
  }, {});

  // Transaction breakdown (Subscription vs Micro-transaction)
  const revenueBreakdown = transactions.reduce((acc: any, t: any) => {
    const type = t.type === 'subscription' ? 'Subscriptions' : 'Micro-transactions';
    acc[type] = (acc[type] || 0) + (t.amount_cents || 0) / 100;
    return acc;
  }, {});

  // Product Analytics (Revenue by Item)
  const productAnalytics = transactions.reduce((acc: any, t: any) => {
    if (t.type === 'micro-transaction') {
      const item = t.item_id || 'Unknown Product';
      if (!acc[item]) acc[item] = { revenue: 0, sales: 0 };
      acc[item].revenue += (t.amount_cents || 0) / 100;
      acc[item].sales += 1;
    }
    return acc;
  }, {});

  // User Consumption Tracking
  const userConsumption = users.map((u: any) => {
    const userTransactions = transactions.filter((t: any) => t.user_id === u.id);
    const purchases = userTransactions.filter((t: any) => t.type === 'micro-transaction').map((t: any) => t.item_id);
    const valLimit = u.tier === 'starter' ? 3 : (u.tier === 'enthusiast' ? 5 : Infinity);
    const guideLimit = u.tier === 'starter' ? 3 : Infinity;
    
    return {
      id: u.id,
      email: u.email,
      tier: u.tier,
      valuations: u.valuation_count,
      guides: u.guide_count,
      valLimit,
      guideLimit,
      isHittingLimits: (u.valuation_count >= valLimit) || (u.guide_count >= guideLimit),
      purchases
    };
  });

  // Projected MRR
  const tierPrices: any = {
    'enthusiast': 29,
    'entrepreneur': 79,
    'dealership': 249,
    'starter': 0
  };
  const projectedMRR = users.reduce((acc: number, u: any) => acc + (tierPrices[u.tier] || 0), 0);

  return {
    stats: {
      totalUsers,
      totalRevenue,
      activeListings,
      valuationConversionRate: valuationConversionRate.toFixed(1),
      tierBreakdown,
      transactionBreakdown: revenueBreakdown,
      productAnalytics,
      projectedMRR,
      totalAssets: assets.length,
      totalInspections: inspections.length,
    },
    users,
    transactions,
    userConsumption,
    assets,
    inspections,
    deals,
    orders,
    notifications,
  };
});

const updateUser = createServerFn({ method: "POST" })
  .validator((data: { userId: string, tier: string, valuationCount: number, guideCount: number }) => data)
  .handler(async ({ data }) => {
    const validTiers = ['starter', 'enthusiast', 'entrepreneur', 'dealership'];
    const tier = validTiers.includes(data.tier) ? data.tier : 'starter';
    await teamDb(`UPDATE users SET tier = '${tier}', valuation_count = ${data.valuationCount}, guide_count = ${data.guideCount} WHERE id = '${data.userId}'`);
    return { success: true };
  });

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — MuscleCars.ai" },
      { name: "description", content: "Analytics, revenue data, and platform management for MuscleCars.ai." },
    ],
  }),
  component: AdminPortal,
});

function AdminPortal() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"dashboard" | "users" | "transactions" | "consumption" | "assets" | "support" | "leads">("dashboard");
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "Muscle.admin2026") {
      setIsAuthenticated(true);
      localStorage.setItem("admin_auth", "true");
      fetchData();
    } else {
      setError("Invalid password");
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getAdminData();
      setData(result);
    } catch (err) {
      setError("Failed to fetch admin data");
    } finally {
      setLoading(false);
    }
  };

  const handleInspect = (userId: string) => {
    setSelectedUserId(userId);
    setActiveTab("support");
  };

  useEffect(() => {
    if (localStorage.getItem("admin_auth") === "true") {
      setIsAuthenticated(true);
      fetchData();
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-charcoal px-6">
        <div className="w-full max-w-md rounded-xl bg-dark-steel p-8 shadow-2xl border border-white/5">
          <h1 className="mb-6 text-3xl font-black text-white italic tracking-tighter">Admin <span className="text-racing-red">Login</span></h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-black uppercase tracking-widest text-titanium">
                Secure Key
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-charcoal px-4 py-2 text-white focus:border-racing-red focus:outline-none font-mono"
                required
              />
            </div>
            {error && <p className="text-xs font-bold text-racing-red uppercase">{error}</p>}
            <button
              type="submit"
              className="w-full rounded-lg bg-racing-red py-3 font-black uppercase tracking-widest text-white hover:bg-racing-red-light transition-colors"
            >
              Initialize Access
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-charcoal">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-racing-red border-t-transparent"></div>
          <p className="text-xs font-black uppercase tracking-widest text-titanium animate-pulse">Loading Analytics Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-charcoal text-white font-body selection:bg-racing-red selection:text-white">
      {/* Top Navigation */}
      <nav className="border-b border-white/5 bg-charcoal/50 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-black italic tracking-tighter cursor-pointer" onClick={() => setActiveTab("dashboard")}>Admin <span className="text-racing-red">Dashboard</span></h1>
              <div className="hidden lg:flex items-center gap-1">
                <TabButton active={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")}>Analytics</TabButton>
                <TabButton active={activeTab === "users"} onClick={() => setActiveTab("users")}>Accounts</TabButton>
                <TabButton active={activeTab === "consumption"} onClick={() => setActiveTab("consumption")}>Usage</TabButton>
                <TabButton active={activeTab === "transactions"} onClick={() => setActiveTab("transactions")}>Revenue</TabButton>
                <TabButton active={activeTab === "assets"} onClick={() => setActiveTab("assets")}>Assets</TabButton>
                <TabButton active={activeTab === "support"} onClick={() => setActiveTab("support")}>Support</TabButton>
                <TabButton active={activeTab === "leads"} onClick={() => setActiveTab("leads")}>Leads</TabButton>
              </div>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem("admin_auth");
                setIsAuthenticated(false);
              }}
              className="text-[10px] font-black uppercase tracking-widest text-titanium hover:text-white transition-colors"
            >
              Terminate Session
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-12 lg:px-8 bg-carbon-fiber min-h-screen">
        {activeTab === "dashboard" && <DashboardView data={data} onInspect={handleInspect} />}
        {activeTab === "users" && <UsersView data={data} onInspect={handleInspect} />}
        {activeTab === "consumption" && <ConsumptionView data={data} onInspect={handleInspect} />}
        {activeTab === "transactions" && <TransactionsView data={data} />}
        {activeTab === "assets" && <AssetsView data={data} />}
        {activeTab === "support" && <SupportView data={data} onUpdate={fetchData} selectedUserId={selectedUserId} setSelectedUserId={setSelectedUserId} />}
        {activeTab === "leads" && <LeadsView data={data} />}
      </main>
    </div>
  );
}

function TabButton({ children, active, onClick }: { children: React.ReactNode, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
        active ? 'text-white border-b-2 border-racing-red' : 'text-titanium hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

function DashboardView({ data }: { data: any }) {
  return (
    <div className="space-y-12">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value={data.stats.totalUsers} />
        <StatCard title="Gross Revenue" value={`$${(data.stats.totalRevenue || 0).toLocaleString()}`} />
        <StatCard title="Projected MRR" value={`$${(data.stats.projectedMRR || 0).toLocaleString()}`} />
        <StatCard title="Assets Generated" value={data.stats.totalAssets} />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Tier Breakdown */}
        <div className="rounded-xl border border-white/5 bg-dark-steel p-8 shadow-2xl">
          <h3 className="mb-6 text-sm font-black uppercase tracking-widest text-racing-red italic">Subscription Distribution</h3>
          <div className="space-y-4">
            {Object.entries(data.stats.tierBreakdown).map(([tier, count]: [any, any]) => (
              <div key={tier} className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-tight text-titanium">{tier}</span>
                <div className="flex items-center gap-4 flex-1 mx-4">
                  <div className="h-2 flex-1 rounded-full bg-charcoal overflow-hidden">
                    <div 
                      className="h-full bg-racing-red shadow-[0_0_10px_rgba(220,38,38,0.5)]" 
                      style={{ width: `${(count / (data.stats.totalUsers || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm font-black font-mono">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Transaction Breakdown */}
        <div className="rounded-xl border border-white/5 bg-dark-steel p-8 shadow-2xl">
          <h3 className="mb-6 text-sm font-black uppercase tracking-widest text-racing-red italic">Revenue by Source</h3>
          <div className="space-y-4">
            {Object.entries(data.stats.transactionBreakdown).map(([type, amount]: [any, any]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-tight text-titanium">{type || 'Unknown'}</span>
                <div className="flex items-center gap-4 flex-1 mx-4">
                  <div className="h-2 flex-1 rounded-full bg-charcoal overflow-hidden">
                    <div 
                      className="h-full bg-emerald" 
                      style={{ width: `${(amount / (data.stats.totalRevenue || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm font-black font-mono text-emerald">${amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Product Analytics */}
        <div className="rounded-xl border border-white/5 bg-dark-steel p-8 shadow-2xl lg:col-span-2">
          <h3 className="mb-6 text-sm font-black uppercase tracking-widest text-racing-red italic">Garage Shop Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-charcoal text-[10px] uppercase text-titanium font-black tracking-widest border-b border-white/5">
                <tr>
                  <th className="px-6 py-4">Product / Service</th>
                  <th className="px-6 py-4 text-center">Volume</th>
                  <th className="px-6 py-4 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {Object.entries(data.stats.productAnalytics).map(([item, stats]: [any, any]) => (
                  <tr key={item} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-black uppercase tracking-tight text-white italic">{item}</td>
                    <td className="px-6 py-4 text-center font-mono text-titanium">{stats.sales}</td>
                    <td className="px-6 py-4 text-right font-mono text-emerald font-black">${stats.revenue.toFixed(2)}</td>
                  </tr>
                ))}
                {Object.keys(data.stats.productAnalytics).length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-titanium italic text-xs uppercase tracking-widest">No micro-transactions recorded.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function UsersView({ data, onInspect }: { data: any, onInspect: (id: string) => void }) {
  const [search, setSearch] = useState("");
  const filteredUsers = (data.users || []).filter((user: any) => 
    user.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black tracking-tight uppercase italic">User Registry</h2>
        <input
          type="text"
          placeholder="Filter by Email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border border-white/10 bg-dark-steel px-4 py-2 text-xs text-white focus:border-racing-red focus:outline-none w-64 font-mono"
        />
      </div>
      <div className="overflow-hidden rounded-xl border border-white/5 bg-dark-steel shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-charcoal text-[10px] uppercase text-titanium font-black tracking-widest">
              <tr>
                <th className="px-6 py-4">Identity</th>
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4 text-center">Valuations</th>
                <th className="px-6 py-4 text-center">Guides</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((user: any) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-white font-mono text-xs">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-tighter ${
                      user.tier === 'starter' ? 'bg-white/10 text-titanium' : 'bg-gold/10 text-gold border border-gold/20'
                    }`}>
                      {user.tier}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-titanium font-mono">{user.valuation_count}</td>
                  <td className="px-6 py-4 text-center text-titanium font-mono">{user.guide_count}</td>
                  <td className="px-6 py-4 text-titanium text-[10px] uppercase font-black">{new Date(user.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => onInspect(user.id)}
                      className="rounded bg-racing-red/10 px-3 py-1 text-[10px] font-black uppercase text-racing-red hover:bg-racing-red hover:text-white transition-all"
                    >
                      Inspect Account
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TransactionsView({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-black tracking-tight uppercase italic">Transaction Logs</h2>
      <div className="overflow-hidden rounded-xl border border-white/5 bg-dark-steel shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-charcoal text-[10px] uppercase text-titanium font-black tracking-widest">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Item Details</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-center">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {(data.transactions || []).map((tx: any) => (
                <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-white font-mono text-xs">{tx.email}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black uppercase ${tx.type === 'subscription' ? 'text-gold' : 'text-titanium'}`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white font-black uppercase italic text-xs truncate max-w-[200px]">{tx.item_id || 'N/A'}</td>
                  <td className="px-6 py-4 text-right font-black text-emerald font-mono">
                    ${(tx.amount_cents / 100).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-center text-titanium text-[10px] uppercase font-black">
                    {new Date(tx.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AssetsView({ data }: { data: any }) {
  return (
    <div className="space-y-12">
      <section className="space-y-6">
        <h2 className="text-xl font-black tracking-tight uppercase italic">Generated Assets (AI Enhancement)</h2>
        <div className="overflow-hidden rounded-xl border border-white/5 bg-dark-steel shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-charcoal text-[10px] uppercase text-titanium font-black tracking-widest">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Asset Name</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Generated At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(data.assets || []).map((asset: any) => (
                  <tr key={asset.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-titanium">{asset.email}</td>
                    <td className="px-6 py-4 font-black uppercase italic text-white">{asset.name}</td>
                    <td className="px-6 py-4">
                      <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] font-black uppercase text-titanium">
                        {asset.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-titanium text-[10px] uppercase font-black">
                      {new Date(asset.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-black tracking-tight uppercase italic text-gold">Physical Inspection Requests</h2>
        <div className="overflow-hidden rounded-xl border border-white/5 bg-dark-steel shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-charcoal text-[10px] uppercase text-titanium font-black tracking-widest border-b border-gold/10">
                <tr>
                  <th className="px-6 py-4">Requester</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(data.inspections || []).map((insp: any) => (
                  <tr key={insp.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-titanium">{insp.email}</td>
                    <td className="px-6 py-4 text-white font-medium italic">{insp.location}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-tighter ${
                        insp.status === 'completed' ? 'bg-emerald/10 text-emerald border border-emerald/20' : 
                        insp.status === 'scheduled' ? 'bg-gold/10 text-gold border border-gold/20' : 
                        'bg-racing-red/10 text-racing-red border border-racing-red/20'
                      }`}>
                        {insp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-titanium text-[10px] uppercase font-black">
                      {new Date(insp.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {data.inspections?.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-titanium italic text-xs uppercase tracking-widest">No inspection bookings found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

function SupportView({ data, onUpdate, selectedUserId, setSelectedUserId }: { data: any, onUpdate: () => void, selectedUserId: string, setSelectedUserId: (id: string) => void }) {
  const [tier, setTier] = useState("starter");
  const [valCount, setValCount] = useState(0);
  const [guideCount, setGuideCount] = useState(0);
  const [updating, setUpdating] = useState(false);

  const selectedUser = (data.users || []).find((u: any) => u.id === selectedUserId);
  const userTransactions = (data.transactions || []).filter((tx: any) => tx.user_id === selectedUserId);
  const userAssets = (data.assets || []).filter((a: any) => a.user_id === selectedUserId);
  const userInspections = (data.inspections || []).filter((i: any) => i.user_id === selectedUserId);

  useEffect(() => {
    if (selectedUser) {
      setTier(selectedUser.tier);
      setValCount(selectedUser.valuation_count);
      setGuideCount(selectedUser.guide_count);
    }
  }, [selectedUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await updateUser({ data: { userId: selectedUserId, tier, valuationCount: valCount, guideCount: guideCount } });
      alert("User updated successfully");
      onUpdate();
    } catch (err) {
      alert("Failed to update user");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black tracking-tight uppercase italic">Account Inspector</h2>
        <div className="flex gap-4">
          <select 
            value={selectedUserId} 
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="rounded-lg border border-white/10 bg-dark-steel px-4 py-2 text-white focus:border-racing-red focus:outline-none font-mono text-xs w-64"
          >
            <option value="">Select Account to Inspect...</option>
            {data.users?.map((u: any) => (
              <option key={u.id} value={u.id}>{u.email}</option>
            ))}
          </select>
          {selectedUserId && (
            <button 
              onClick={() => setSelectedUserId("")}
              className="text-[10px] font-black uppercase tracking-widest text-titanium hover:text-racing-red transition-colors"
            >
              Clear Selection
            </button>
          )}
        </div>
      </div>

      {!selectedUser ? (
        <div className="rounded-xl border border-white/5 bg-dark-steel p-20 shadow-2xl flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-titanium">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <h3 className="text-sm font-black uppercase tracking-widest text-white">No Account Selected</h3>
          <p className="text-xs text-titanium mt-2 max-w-xs">Choose a customer from the dropdown above or click "Inspect" in the Accounts or Usage tabs to view detailed history.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column: Profile & Overrides */}
          <div className="space-y-6">
            <div className="rounded-xl border border-white/5 bg-dark-steel p-6 shadow-2xl space-y-6">
              <div className="border-b border-white/5 pb-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-titanium mb-1">Identity</p>
                <p className="text-sm font-black text-white font-mono break-all">{selectedUser.email}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-titanium mt-4 mb-1">Active Subscription</p>
                <div className="flex items-center gap-2">
                  <span className={`rounded px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter ${
                    selectedUser.tier === 'starter' ? 'bg-white/10 text-titanium' : 'bg-gold text-charcoal'
                  }`}>
                    {selectedUser.tier} Tier
                  </span>
                  <span className="text-[10px] text-titanium uppercase font-black">Since {new Date(selectedUser.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-racing-red italic">Support Overrides</h4>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-titanium">Subscription Tier</label>
                    <select 
                      value={tier} 
                      onChange={(e) => setTier(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-charcoal px-3 py-1.5 text-xs text-white focus:border-racing-red focus:outline-none font-black uppercase"
                    >
                      <option value="starter">Starter</option>
                      <option value="enthusiast">Enthusiast</option>
                      <option value="entrepreneur">Entrepreneur</option>
                      <option value="dealership">Dealership</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-titanium">Valuations</label>
                      <input 
                        type="number" 
                        value={valCount} 
                        onChange={(e) => setValCount(Number(e.target.value))}
                        className="w-full rounded-lg border border-white/10 bg-charcoal px-3 py-1.5 text-xs text-white focus:border-racing-red focus:outline-none font-mono font-black"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-titanium">Guides</label>
                      <input 
                        type="number" 
                        value={guideCount} 
                        onChange={(e) => setGuideCount(Number(e.target.value))}
                        className="w-full rounded-lg border border-white/10 bg-charcoal px-3 py-1.5 text-xs text-white focus:border-racing-red focus:outline-none font-mono font-black"
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={updating}
                  className="w-full rounded-lg bg-racing-red py-3 text-[10px] font-black uppercase tracking-widest text-white hover:bg-racing-red-light transition-colors disabled:opacity-50"
                >
                  {updating ? 'Updating...' : 'Update Permissions'}
                </button>
              </form>
            </div>
          </div>

          {/* Middle & Right Column: Activity History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Transaction History */}
            <div className="rounded-xl border border-white/5 bg-dark-steel shadow-2xl overflow-hidden">
              <div className="bg-charcoal/50 px-6 py-4 border-b border-white/5">
                <h4 className="text-xs font-black uppercase tracking-widest text-white italic">Billing & Subscriptions</h4>
              </div>
              <div className="p-0">
                <table className="w-full text-left text-xs">
                  <thead className="bg-charcoal/30 text-[9px] uppercase text-titanium font-black tracking-widest border-b border-white/5">
                    <tr>
                      <th className="px-6 py-3">Type</th>
                      <th className="px-6 py-3">Item / Description</th>
                      <th className="px-6 py-3 text-right">Amount</th>
                      <th className="px-6 py-3 text-center">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {userTransactions.map((tx: any) => (
                      <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <span className={`text-[9px] font-black uppercase ${tx.type === 'subscription' ? 'text-gold' : 'text-titanium'}`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-black uppercase italic text-white">{tx.item_id || 'N/A'}</td>
                        <td className="px-6 py-4 text-right font-black text-emerald font-mono">
                          ${(tx.amount_cents / 100).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-center text-titanium text-[9px] uppercase font-black">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                    {userTransactions.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-titanium italic text-[10px] uppercase tracking-widest">No transaction history found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Assets & Inspections */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-white/5 bg-dark-steel shadow-2xl overflow-hidden">
                <div className="bg-charcoal/50 px-6 py-4 border-b border-white/5">
                  <h4 className="text-xs font-black uppercase tracking-widest text-white italic">Digital Assets</h4>
                </div>
                <div className="p-4 space-y-3">
                  {userAssets.map((asset: any) => (
                    <div key={asset.id} className="flex items-center justify-between p-3 rounded-lg bg-charcoal/50 border border-white/5">
                      <div>
                        <p className="text-[10px] font-black uppercase text-white italic">{asset.name}</p>
                        <p className="text-[8px] text-titanium uppercase font-black">{asset.type}</p>
                      </div>
                      <span className="text-[8px] text-titanium uppercase font-black">{new Date(asset.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                  {userAssets.length === 0 && (
                    <p className="text-center py-6 text-titanium italic text-[10px] uppercase tracking-widest">No generated assets.</p>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-white/5 bg-dark-steel shadow-2xl overflow-hidden">
                <div className="bg-charcoal/50 px-6 py-4 border-b border-white/5">
                  <h4 className="text-xs font-black uppercase tracking-widest text-white italic">Physical Service</h4>
                </div>
                <div className="p-4 space-y-3">
                  {userInspections.map((insp: any) => (
                    <div key={insp.id} className="p-3 rounded-lg bg-charcoal/50 border border-white/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                          insp.status === 'completed' ? 'bg-emerald/10 text-emerald' : 'bg-gold/10 text-gold'
                        }`}>
                          {insp.status}
                        </span>
                        <span className="text-[8px] text-titanium uppercase font-black">{new Date(insp.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-[10px] font-black text-white italic">{insp.location}</p>
                    </div>
                  ))}
                  {userInspections.length === 0 && (
                    <p className="text-center py-6 text-titanium italic text-[10px] uppercase tracking-widest">No service bookings.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  const displayValue = (typeof value === 'object' && value !== null) 
    ? JSON.stringify(value) 
    : String(value ?? '0');

  return (
    <div className="rounded-xl border border-white/5 bg-dark-steel p-6 shadow-2xl group hover:border-racing-red/30 transition-all card-accent relative overflow-hidden">
      <div className="absolute top-0 right-0 w-16 h-16 bg-racing-red/5 -rotate-45 translate-x-8 -translate-y-8 group-hover:bg-racing-red/10 transition-colors" />
      <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-titanium group-hover:text-racing-red transition-colors relative z-10">{title}</p>
      <p className="text-3xl font-black text-white font-mono tracking-tighter relative z-10 italic">{displayValue}</p>
    </div>
  );
}

function ConsumptionView({ data, onInspect }: { data: any, onInspect: (id: string) => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black tracking-tight uppercase italic">Limit Enforcement Tracker</h2>
        <div className="bg-racing-red/10 border border-racing-red/20 px-4 py-2 rounded-lg text-[10px] font-black uppercase text-racing-red tracking-widest animate-pulse">
          {data.userConsumption?.filter((u: any) => u.isHittingLimits).length} High-Conversion Targets (At Limit)
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/5 bg-dark-steel shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-charcoal text-[10px] uppercase text-titanium font-black tracking-widest">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Valuation Consumption</th>
                <th className="px-6 py-4 text-center">Guide Consumption</th>
                <th className="px-6 py-4">Garage Shop Purchases</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.userConsumption?.map((u: any, idx: number) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-white font-mono text-xs">{u.email}</td>
                  <td className="px-6 py-4">
                    {u.isHittingLimits ? (
                      <span className="rounded-full bg-racing-red/10 text-racing-red px-2.5 py-0.5 text-[10px] font-black uppercase tracking-tighter border border-racing-red/20 italic">
                        Limit Reached
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald/10 text-emerald px-2.5 py-0.5 text-[10px] font-black uppercase tracking-tighter border border-emerald/20 italic">
                        Active Flow
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className={`font-mono text-xs font-black ${u.valuations >= u.valLimit ? 'text-racing-red' : 'text-titanium'}`}>
                        {u.valuations} / {u.valLimit === Infinity ? '∞' : u.valLimit}
                      </span>
                      <div className="w-24 h-1 bg-charcoal rounded-full overflow-hidden">
                        <div
                          className={`h-full ${u.valuations >= u.valLimit ? 'bg-racing-red shadow-[0_0_8px_red]' : 'bg-titanium'}`}
                          style={{ width: `${Math.min((u.valuations / (u.valLimit === Infinity ? 100 : u.valLimit)) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className={`font-mono text-xs font-black ${u.guides >= u.guideLimit ? 'text-racing-red' : 'text-titanium'}`}>
                        {u.guides} / {u.guideLimit === Infinity ? '∞' : u.guideLimit}
                      </span>
                      <div className="w-24 h-1 bg-charcoal rounded-full overflow-hidden">
                        <div
                          className={`h-full ${u.guides >= u.guideLimit ? 'bg-racing-red shadow-[0_0_8px_red]' : 'bg-titanium'}`}
                          style={{ width: `${Math.min((u.guides / (u.guideLimit === Infinity ? 100 : u.guideLimit)) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {u.purchases.length > 0 ? (
                        u.purchases.map((p: string, pIdx: number) => (
                          <span key={pIdx} className="bg-gold/10 text-gold px-2 py-0.5 rounded text-[9px] font-black uppercase border border-gold/20 italic">
                            {p}
                          </span>
                        ))
                      ) : (
                        <span className="text-titanium text-[10px] italic">No transactions</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => onInspect(u.id)}
                      className="text-titanium hover:text-white transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.644C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
