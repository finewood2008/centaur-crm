/* ── 核心类型 ─────────────────────────────────── */

export interface Customer {
  id: string;
  name: string;             // 企业名称
  taxId: string;            // 税号
  contact: string;          // 联系人
  phone: string;
  industry: string;
  taxpayerType: '小规模' | '一般纳税人';
  registeredCapital: string;
  establishedDate: string;
  employeeCount: number;
  monthlyRevenue: number;   // 月均营收(万)
  services: string[];       // 当前服务
  healthScore: number;      // 0-100
  status: 'active' | 'attention' | 'risk';
  lastContact: string;
  assignedTo: string;       // 负责会计
  tags: string[];
  address: string;
}

export interface Task {
  id: string;
  customerId: string;
  customerName: string;
  type: 'tax_filing' | 'annual_report' | 'license_renewal' | 'social_security' | 'invoice' | 'other';
  title: string;
  deadline: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority: 'high' | 'medium' | 'low';
  assignedTo: string;
}

export interface Opportunity {
  id: string;
  customerId: string;
  customerName: string;
  service: string;          // 推荐服务
  reason: string;           // AI推荐理由
  estimatedValue: number;   // 预估金额
  confidence: number;       // AI置信度 0-100
  status: 'new' | 'following' | 'won' | 'lost';
  createdAt: string;
  suggestedTalk: string;    // AI建议话术
}

export interface PolicyAlert {
  id: string;
  title: string;
  source: string;           // 来源机构
  publishDate: string;
  summary: string;
  impact: 'high' | 'medium' | 'low';
  affectedCount: number;    // 影响客户数
  affectedCustomerIds: string[];
  category: 'tax' | 'social_security' | 'business' | 'subsidy';
  actionSuggestion: string;
  isRead: boolean;
}

/* ── 客户动态 ─────────────────────────────────── */
export interface CustomerEvent {
  id: string;
  customerId: string;
  customerName: string;
  type: 'contact' | 'change' | 'risk' | 'service' | 'opportunity' | 'policy';
  title: string;
  description: string;
  timestamp: string;
  source?: string;          // AI / 手动 / 工商系统 等
}

/* ── AI监控任务 ────────────────────────────────── */
export interface MonitorRule {
  id: string;
  name: string;
  type: 'business_change' | 'tax_anomaly' | 'public_opinion' | 'license_expiry' | 'legal_risk';
  description: string;
  frequency: 'daily' | 'weekly' | 'realtime';
  enabled: boolean;
  lastRun?: string;
  affectedCustomerIds: string[];
}

export interface MonitorAlert {
  id: string;
  ruleId: string;
  ruleName: string;
  customerId: string;
  customerName: string;
  type: MonitorRule['type'];
  severity: 'critical' | 'warning' | 'info';
  title: string;
  detail: string;
  source: string;
  discoveredAt: string;
  isHandled: boolean;
}

/* ── AI沟通 ───────────────────────────────────── */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  customerId?: string;
  customerName?: string;
  type?: 'text' | 'template';
}

/* ── 客户导入 ──────────────────────────────────── */
export interface ImportField {
  original: string;         // 原始列名
  mapped: string;           // 映射到CRM字段
  sample: string;           // 样例值
  confidence: number;       // AI映射置信度
}

export interface ImportPreview {
  totalRows: number;
  fields: ImportField[];
  duplicates: number;
  warnings: string[];
}

export type NavItem = 'dashboard' | 'customers' | 'calendar' | 'opportunities' | 'policies'
  | 'import' | 'monitor' | 'cockpit';

/* ── AI Native 类型 ───────────────────────────── */

export type ViewMode = 'briefing' | 'chat';
