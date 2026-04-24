import { Badge, Card } from '../components/ui';
import { Building2, Phone, Activity, Calendar, TrendingUp, Users } from 'lucide-react';
import type { Customer } from '../types';

interface Props {
  customer: Customer;
}

export default function CustomerProfileCard({ customer }: Props) {
  const healthColor = customer.healthScore >= 80 ? 'text-green-400' : customer.healthScore >= 60 ? 'text-amber-400' : 'text-red-400';
  const statusLabel = { active: '正常', attention: '关注', risk: '风险' }[customer.status];

  return (
    <Card padding="md" hover={false} className="my-2">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-[15px] font-bold shrink-0"
          style={{
            background: customer.status === 'active' ? 'rgba(34,197,94,0.15)' : customer.status === 'attention' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
            color: customer.status === 'active' ? '#22c55e' : customer.status === 'attention' ? '#f59e0b' : '#ef4444',
          }}
        >
          {customer.name.slice(0, 1)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-[14px] font-semibold text-[var(--color-t1)] truncate">{customer.name}</h4>
            <Badge variant={customer.status === 'active' ? 'ok' : customer.status === 'attention' ? 'warn' : 'bad'}>{statusLabel}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2">
            <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-t3)]">
              <Building2 size={11} /> {customer.industry}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-t3)]">
              <Phone size={11} /> {customer.phone}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-t3)]">
              <Users size={11} /> {customer.contact}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-t3)]">
              <Calendar size={11} /> {customer.lastContact}
            </div>
          </div>

          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[var(--color-b0)]">
            <div className="flex items-center gap-1.5">
              <Activity size={12} className={healthColor} />
              <span className={`mono text-[12px] font-semibold ${healthColor}`}>{customer.healthScore}</span>
              <span className="text-[10px] text-[var(--color-t4)]">健康分</span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp size={12} className="text-[var(--color-t3)]" />
              <span className="mono text-[12px] text-[var(--color-t2)]">¥{customer.monthlyRevenue}万</span>
              <span className="text-[10px] text-[var(--color-t4)]">月营收</span>
            </div>
            <div className="text-[10px] text-[var(--color-t4)]">
              {customer.services.length}项服务
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
