import React, { useState } from 'react';

export function LeadsView({ data }: { data: any }) {
  const [leadTab, setLeadTab] = useState<"deals" | "orders" | "notifications">("deals");
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b border-white/5 pb-4">
        <button onClick={() => setLeadTab("deals")} className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${leadTab === 'deals' ? 'text-white border-b-2 border-racing-red' : 'text-titanium hover:text-white'}`}>Outreach Leads</button>
        <button onClick={() => setLeadTab("orders")} className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${leadTab === 'orders' ? 'text-white border-b-2 border-racing-red' : 'text-titanium hover:text-white'}`}>Orders</button>
        <button onClick={() => setLeadTab("notifications")} className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${leadTab === 'notifications' ? 'text-white border-b-2 border-racing-red' : 'text-titanium hover:text-white'}`}>Notifications</button>
      </div>
      {leadTab === "deals" && (
        <div className="overflow-hidden rounded-xl border border-white/5 bg-dark-steel shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-charcoal text-[10px] uppercase text-titanium font-black tracking-widest">
                <tr><th className="px-6 py-4">Company</th><th className="px-6 py-4">Contact</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Tier</th><th className="px-6 py-4">Value</th><th className="px-6 py-4">Notes</th></tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.deals?.length > 0 ? data.deals.map((d: any, i: number) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium text-white font-mono text-xs">{d.company_name || '—'}</td>
                    <td className="px-6 py-4 font-mono text-xs text-titanium">{d.contact_name || '—'}<br/>{d.contact_email || ''}</td>
                    <td className="px-6 py-4"><span className="rounded-full bg-gold/10 text-gold px-2.5 py-0.5 text-[10px] font-black uppercase tracking-tighter border border-gold/20 italic">{d.status}</span></td>
                    <td className="px-6 py-4 text-xs text-titanium">{d.tier || '—'}</td>
                    <td className="px-6 py-4 font-mono text-xs text-titanium">{d.estimated_value || '—'}</td>
                    <td className="px-6 py-4 text-xs text-titanium/50 max-w-[200px] truncate">{d.notes || '—'}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-titanium/50 text-xs font-bold uppercase tracking-widest">No deals found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {leadTab === "orders" && (
        <div className="overflow-hidden rounded-xl border border-white/5 bg-dark-steel shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-charcoal text-[10px] uppercase text-titanium font-black tracking-widest">
                <tr><th className="px-6 py-4">Type</th><th className="px-6 py-4">Item</th><th className="px-6 py-4">Amount</th><th className="px-6 py-4">Details</th></tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.orders?.length > 0 ? data.orders.map((o: any, i: number) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4"><span className="rounded-full bg-gold/10 text-gold px-2.5 py-0.5 text-[10px] font-black uppercase tracking-tighter border border-gold/20 italic">{o.type}</span></td>
                    <td className="px-6 py-4 font-mono text-xs text-white">{o.item_name}</td>
                    <td className="px-6 py-4 font-mono text-xs text-titanium">${(o.amount_cents / 100).toFixed(2)}</td>
                    <td className="px-6 py-4 text-xs text-titanium/50 max-w-[200px] truncate">{o.details || '—'}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="px-6 py-12 text-center text-titanium/50 text-xs font-bold uppercase tracking-widest">No orders</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {leadTab === "notifications" && (
        <div className="overflow-hidden rounded-xl border border-white/5 bg-dark-steel shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-charcoal text-[10px] uppercase text-titanium font-black tracking-widest">
                <tr><th className="px-6 py-4">Type</th><th className="px-6 py-4">Item / Customer</th><th className="px-6 py-4">Owner</th><th className="px-6 py-4">Details</th></tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.notifications?.length > 0 ? data.notifications.map((n: any, i: number) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4"><span className="rounded-full bg-racing-red/10 text-racing-red px-2.5 py-0.5 text-[10px] font-black uppercase border border-racing-red/20 italic">{n.type}</span></td>
                    <td className="px-6 py-4 font-mono text-xs text-white">{n.item_name}<br/><span className="text-titanium/50">{n.customer_email}</span></td>
                    <td className="px-6 py-4 font-mono text-xs text-titanium">{n.owner_email}</td>
                    <td className="px-6 py-4 text-xs text-titanium/50 max-w-[200px] truncate">{n.details || '—'}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="px-6 py-12 text-center text-titanium/50 text-xs font-bold uppercase tracking-widest">No notifications</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}