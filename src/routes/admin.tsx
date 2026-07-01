import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState, useEffect } from "react";
import { teamDb } from "../lib/db";

// Server functions for admin data
const getAdminData = createServerFn({ method: "GET" }).handler(async () => {
  const users = await teamDb("SELECT * FROM users ORDER BY created_at DESC");
  const transactions = await teamDb("SELECT t.*, u.email FROM transactions t JOIN users u ON t.user_id = u.id ORDER BY t.created_at DESC");
  const cars = await teamDb("SELECT * FROM cars ORDER BY created_at DESC");
  const valuations = await teamDb("SELECT * FROM valuations");

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
    
    return {
      email: u.email,
      tier: u.tier,
      valuations: u.valuation_count,
      guides: u.guide_count,
      isHittingLimits: u.tier === 'starter' && (u.valuation_count >= 3 || u.guide_count >= 3),
      purchases
    };
  }).filter(u => u.isHittingLimits || u.purchases.length > 0);

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
      transactionBreakdown: revenueBreakdown, // Use the more explicit breakdown
      productAnalytics,
      projectedMRR,
    },
    users,
    transactions,
    userConsumption,
  };
});

const updateUser = createServerFn({ method: "POST" })
  .validator((data: { userId: string, tier: string, valuationCount: number, guideCount: number }) => data)
  .handler(async ({ data }) => {
    // Simple sanitization for tier
    const validTiers = ['starter', 'enthusiast', 'entrepreneur', 'dealership'];
    const tier = validTiers.includes(data.tier) ? data.tier : 'starter';
    
    teamDb(`UPDATE users SET tier = '${tier}', valuation_count = ${data.valuationCount}, guide_count = ${data.guideCount} WHERE id = '${data.userId}'`);
    return { success: true };
  });

export const Route = createFileRoute("/admin")({
  component: AdminPortal,
});

function AdminPortal() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"dashboard" | "users" | "transactions" | "consumption" | "support">("dashboard");

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
                className="w-full rounded-lg border border-white/10 bg-charcoal px-4 py-2 text-white focus:border-racing-red focus:outline-none"
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
              <h1 className="text-2xl font-black italic tracking-tighter">Admin <span className="text-racing-red">Dashboard</span></h1>
              <div className="hidden md:flex items-center gap-1">
                <TabButton active={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")}>Analytics</TabButton>
                <TabButton active={activeTab === "users"} onClick={() => setActiveTab("users")}>Accounts</TabButton>
                <TabButton active={activeTab === "consumption"} onClick={() => setActiveTab("consumption")}>Consumption</TabButton>
                <TabButton active={activeTab === "transactions"} onClick={() => setActiveTab("transactions")}>Revenue</TabButton>
                <TabButton active={activeTab === "support"} onClick={() => setActiveTab("support")}>Support</TabButton>
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

      <main className="mx-auto max-w-7xl px-6 py-12 lg:px-8 bg-carbon-fiber">
        {activeTab === "dashboard" && <DashboardView data={data} />}
        {activeTab === "users" && <UsersView data={data} />}
        {activeTab === "consumption" && <ConsumptionView data={data} />}
        {activeTab === "transactions" && <TransactionsView data={data} />}
        {activeTab === "support" && <SupportView data={data} onUpdate={fetchData} />}
      </main>
    </div>
  );
}

function TabButton({ children, active, onClick }: { children: React.ReactNode, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-xs font-black uppercase tracking-widest transition-all ${
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
        <StatCard title="Active Listings" value={data.stats.activeListings} />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Tier Breakdown */}
        <div className="rounded-xl border border-white/5 bg-dark-steel p-8 shadow-2xl">
          <h3 className="mb-6 text-sm font-black uppercase tracking-widest text-racing-red">Subscription Distribution</h3>
          <div className="space-y-4">
            {Object.entries(data.stats.tierBreakdown).map(([tier, count]: [any, any]) => (
              <div key={tier} className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-tight text-titanium">{tier}</span>
                <div className="flex items-center gap-4 flex-1 mx-4">
                  <div className="h-2 flex-1 rounded-full bg-charcoal overflow-hidden">
                    <div 
                      className="h-full bg-racing-red" 
                      style={{ width: `${(count / (data.stats.totalUsers || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm font-black font-mono">{count}</span>
              </div>
            ))}
            {Object.keys(data.stats.tierBreakdown).length === 0 && (
              <p className="text-xs text-titanium italic text-center py-4">No users registered yet.</p>
            )}
          </div>
        </div>

        {/* Transaction Breakdown */}
        <div className="rounded-xl border border-white/5 bg-dark-steel p-8 shadow-2xl">
          <h3 className="mb-6 text-sm font-black uppercase tracking-widest text-racing-red">Revenue by Source</h3>
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
            {Object.keys(data.stats.transactionBreakdown).length === 0 && (
              <p className="text-xs text-titanium italic text-center py-4">No transactions recorded.</p>
            )}
          </div>
        </div>

        {/* Product Analytics */}
        <div className="rounded-xl border border-white/5 bg-dark-steel p-8 shadow-2xl lg:col-span-2">
          <h3 className="mb-6 text-sm font-black uppercase tracking-widest text-racing-red">Product Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-charcoal text-[10px] uppercase text-titanium font-black tracking-widest">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4 text-center">Sales</th>
                  <th className="px-6 py-4 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {Object.entries(data.stats.productAnalytics).map(([item, stats]: [any, any]) => (
                  <tr key={item} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-black uppercase tracking-tight text-white">{item}</td>
                    <td className="px-6 py-4 text-center font-mono">{stats.sales}</td>
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

function UsersView({ data }: { data: any }) {
  const [search, setSearch] = useState("");
  const filteredUsers = (data.users || []).filter((user: any) => 
    user.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black tracking-tight uppercase">User Registry</h2>
        <input
          type="text"
          placeholder="Search Registry..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border border-white/10 bg-dark-steel px-4 py-2 text-sm text-white focus:border-racing-red focus:outline-none w-64"
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
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((user: any) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-tighter ${
                      user.tier === 'starter' ? 'bg-white/10 text-titanium' : 'bg-gold/10 text-gold'
                    }`}>
                      {user.tier}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-titanium font-mono">{user.valuation_count}</td>
                  <td className="px-6 py-4 text-center text-titanium font-mono">{user.guide_count}</td>
                  <td className="px-6 py-4 text-titanium text-xs">{new Date(user.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-titanium italic text-xs uppercase tracking-widest">No users found.</td>
                </tr>
              )}
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
      <h2 className="text-xl font-black tracking-tight uppercase">Transaction Logs</h2>
      <div className="overflow-hidden rounded-xl border border-white/5 bg-dark-steel shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-charcoal text-[10px] uppercase text-titanium font-black tracking-widest">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Ref ID</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {(data.transactions || []).map((tx: any) => (
                <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{tx.email}</td>
                  <td className="px-6 py-4 text-titanium uppercase text-[10px] font-black">{tx.type}</td>
                  <td className="px-6 py-4 font-black text-emerald font-mono">
                    ${(tx.amount_cents / 100).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-titanium font-mono text-[10px] truncate max-w-[100px]">{tx.item_id || 'N/A'}</td>
                  <td className="px-6 py-4 text-titanium text-xs">
                    {new Date(tx.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {data.transactions?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-titanium italic text-xs uppercase tracking-widest">No transactions found in logs.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SupportView({ data, onUpdate }: { data: any, onUpdate: () => void }) {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [tier, setTier] = useState("starter");
  const [valCount, setValCount] = useState(0);
  const [guideCount, setGuideCount] = useState(0);
  const [updating, setUpdating] = useState(false);

  const selectedUser = (data.users || []).find((u: any) => u.id === selectedUserId);

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
    <div className="max-w-2xl mx-auto space-y-8">
      <h2 className="text-xl font-black tracking-tight uppercase text-center">Support Overrides</h2>
      <div className="rounded-xl border border-white/5 bg-dark-steel p-8 shadow-2xl space-y-6">
        <div>
          <label className="mb-2 block text-xs font-black uppercase tracking-widest text-titanium">Select Target Account</label>
          <select 
            value={selectedUserId} 
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-charcoal px-4 py-2 text-white focus:border-racing-red focus:outline-none"
          >
            <option value="">Choose User...</option>
            {data.users?.map((u: any) => (
              <option key={u.id} value={u.id}>{u.email}</option>
            ))}
          </select>
        </div>

        {selectedUser && (
          <form onSubmit={handleSubmit} className="space-y-4 border-t border-white/5 pt-6 animate-in fade-in slide-in-from-top-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-titanium">Tier</label>
                <select 
                  value={tier} 
                  onChange={(e) => setTier(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-charcoal px-3 py-1.5 text-xs text-white focus:border-racing-red focus:outline-none"
                >
                  <option value="starter">Starter</option>
                  <option value="enthusiast">Enthusiast</option>
                  <option value="entrepreneur">Entrepreneur</option>
                  <option value="dealership">Dealership</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-titanium">Valuations</label>
                <input 
                  type="number" 
                  value={valCount} 
                  onChange={(e) => setValCount(Number(e.target.value))}
                  className="w-full rounded-lg border border-white/10 bg-charcoal px-3 py-1.5 text-xs text-white focus:border-racing-red focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-titanium">Guides</label>
                <input 
                  type="number" 
                  value={guideCount} 
                  onChange={(e) => setGuideCount(Number(e.target.value))}
                  className="w-full rounded-lg border border-white/10 bg-charcoal px-3 py-1.5 text-xs text-white focus:border-racing-red focus:outline-none"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={updating}
              className="w-full rounded-lg bg-emerald py-2 text-xs font-black uppercase tracking-widest text-white hover:bg-emerald/90 transition-colors disabled:opacity-50"
            >
              {updating ? 'Applying Overrides...' : 'Commit Changes'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  // Defensive rendering for Error #310
  const displayValue = (typeof value === 'object' && value !== null) 
    ? JSON.stringify(value) 
    : String(value ?? '0');

  return (
    <div className="rounded-xl border border-white/5 bg-dark-steel p-6 shadow-2xl group hover:border-racing-red/30 transition-all card-accent">
      <p className="mb-2 text-xs font-black uppercase tracking-widest text-titanium group-hover:text-racing-red transition-colors">{title}</p>
      <p className="text-3xl font-black text-white font-mono tracking-tighter">{displayValue}</p>
    </div>
  );
}

function ConsumptionView({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black tracking-tight uppercase">User Consumption & Limit Tracking</h2>
        <div className="bg-racing-red/10 border border-racing-red/20 px-4 py-2 rounded-lg text-[10px] font-black uppercase text-racing-red tracking-widest">
          {data.userConsumption?.filter((u: any) => u.isHittingLimits).length} Users At Free Tier Limits
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/5 bg-dark-steel shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-charcoal text-[10px] uppercase text-titanium font-black tracking-widest">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Valuations (Used/3)</th>
                <th className="px-6 py-4 text-center">Guides (Used/3)</th>
                <th className="px-6 py-4">Add-on Purchases</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.userConsumption?.map((u: any, idx: number) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{u.email}</td>
                  <td className="px-6 py-4">
                    {u.isHittingLimits ? (
                      <span className="rounded-full bg-racing-red/10 text-racing-red px-2.5 py-0.5 text-[10px] font-black uppercase tracking-tighter border border-racing-red/20">
                        At Limit
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald/10 text-emerald px-2.5 py-0.5 text-[10px] font-black uppercase tracking-tighter border border-emerald/20">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className={`font-mono ${u.valuations >= 3 ? 'text-racing-red font-black' : 'text-titanium'}`}>{u.valuations}</span>
                      <div className="w-16 h-1 bg-charcoal rounded-full overflow-hidden">
                        <div
                          className={`h-full ${u.valuations >= 3 ? 'bg-racing-red' : 'bg-titanium'}`}
                          style={{ width: `${Math.min((u.valuations / 3) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className={`font-mono ${u.guides >= 3 ? 'text-racing-red font-black' : 'text-titanium'}`}>{u.guides}</span>
                      <div className="w-16 h-1 bg-charcoal rounded-full overflow-hidden">
                        <div
                          className={`h-full ${u.guides >= 3 ? 'bg-racing-red' : 'bg-titanium'}`}
                          style={{ width: `${Math.min((u.guides / 3) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {u.purchases.length > 0 ? (
                        u.purchases.map((p: string, pIdx: number) => (
                          <span key={pIdx} className="bg-amber-glow/10 text-amber-glow px-2 py-0.5 rounded text-[9px] font-black uppercase border border-amber-glow/20">
                            {p}
                          </span>
                        ))
                      ) : (
                        <span className="text-titanium text-[10px] italic">None</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {(!data.userConsumption || data.userConsumption.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-titanium italic text-xs uppercase tracking-widest">No users currently tracking consumption or purchases.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
