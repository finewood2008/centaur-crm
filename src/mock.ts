import type { Customer, Task, Opportunity, PolicyAlert, CustomerEvent, MonitorRule, MonitorAlert, ImportField } from './types';

/* ── 客户数据 ─────────────────────────────────── */
export const CUSTOMERS: Customer[] = [
  {
    id: 'c1', name: '杭州锐思科技有限公司', taxId: '91330100MA2H3K4X5Y',
    contact: '张建国', phone: '138****1234', industry: '信息技术',
    taxpayerType: '一般纳税人', registeredCapital: '500万', establishedDate: '2019-03-15',
    employeeCount: 45, monthlyRevenue: 82, services: ['代理记账', '增值税申报', '企业所得税'],
    healthScore: 92, status: 'active', lastContact: '2026-04-21',
    assignedTo: '李会计', tags: ['重点客户', '高新企业'], address: '杭州市西湖区文三路398号',
  },
  {
    id: 'c2', name: '宁波海川贸易有限公司', taxId: '91330200MA6B7C8D9E',
    contact: '王丽芳', phone: '139****5678', industry: '进出口贸易',
    taxpayerType: '一般纳税人', registeredCapital: '1000万', establishedDate: '2017-08-20',
    employeeCount: 28, monthlyRevenue: 156, services: ['代理记账', '出口退税', '外汇核销'],
    healthScore: 78, status: 'attention', lastContact: '2026-03-28',
    assignedTo: '赵会计', tags: ['外贸企业'], address: '宁波市江北区中马路299号',
  },
  {
    id: 'c3', name: '杭州味道餐饮管理有限公司', taxId: '91330100MA2K5L6M7N',
    contact: '刘伟', phone: '137****9012', industry: '餐饮服务',
    taxpayerType: '小规模', registeredCapital: '50万', establishedDate: '2022-06-10',
    employeeCount: 12, monthlyRevenue: 8.5, services: ['代理记账'],
    healthScore: 45, status: 'risk', lastContact: '2026-02-15',
    assignedTo: '李会计', tags: ['流失预警'], address: '杭州市上城区南宋御街88号',
  },
  {
    id: 'c4', name: '浙江绿源环保科技股份有限公司', taxId: '91330000MA3A4B5C6D',
    contact: '陈明华', phone: '136****3456', industry: '环保科技',
    taxpayerType: '一般纳税人', registeredCapital: '2000万', establishedDate: '2015-01-08',
    employeeCount: 120, monthlyRevenue: 380, services: ['代理记账', '税务筹划', '审计服务', '高新认定'],
    healthScore: 95, status: 'active', lastContact: '2026-04-22',
    assignedTo: '赵会计', tags: ['VIP', '上市辅导', '高新企业'], address: '杭州市滨江区江南大道588号',
  },
  {
    id: 'c5', name: '温州鑫达五金制造有限公司', taxId: '91330300MA8E9F0G1H',
    contact: '林小飞', phone: '135****7890', industry: '五金制造',
    taxpayerType: '小规模', registeredCapital: '100万', establishedDate: '2021-11-25',
    employeeCount: 8, monthlyRevenue: 5.2, services: ['代理记账', '个税申报'],
    healthScore: 68, status: 'active', lastContact: '2026-04-18',
    assignedTo: '李会计', tags: [], address: '温州市龙湾区永中街道',
  },
  {
    id: 'c6', name: '杭州云帆网络科技有限公司', taxId: '91330100MA7C8D9E0F',
    contact: '孙婷婷', phone: '158****2345', industry: '互联网',
    taxpayerType: '一般纳税人', registeredCapital: '300万', establishedDate: '2020-05-18',
    employeeCount: 35, monthlyRevenue: 65, services: ['代理记账', '增值税申报'],
    healthScore: 85, status: 'active', lastContact: '2026-04-20',
    assignedTo: '赵会计', tags: ['高新企业'], address: '杭州市余杭区仓前街道梦想小镇',
  },
  {
    id: 'c7', name: '嘉兴恒泰建材有限公司', taxId: '91330400MA5F6G7H8I',
    contact: '周建明', phone: '133****6789', industry: '建材',
    taxpayerType: '一般纳税人', registeredCapital: '800万', establishedDate: '2016-09-12',
    employeeCount: 55, monthlyRevenue: 210, services: ['代理记账', '增值税申报', '印花税'],
    healthScore: 60, status: 'attention', lastContact: '2026-04-05',
    assignedTo: '李会计', tags: ['注意跟进'], address: '嘉兴市南湖区中山东路200号',
  },
  {
    id: 'c8', name: '义乌锦绣电子商务有限公司', taxId: '91330700MA4H9I0J1K',
    contact: '吴晓燕', phone: '159****0123', industry: '电子商务',
    taxpayerType: '小规模', registeredCapital: '30万', establishedDate: '2023-02-28',
    employeeCount: 5, monthlyRevenue: 3.8, services: ['代理记账'],
    healthScore: 72, status: 'active', lastContact: '2026-04-19',
    assignedTo: '赵会计', tags: ['新客户'], address: '义乌市国际商贸城五区',
  },
];

/* ── 待办任务 ─────────────────────────────────── */
export const TASKS: Task[] = [
  { id: 't1', customerId: 'c1', customerName: '杭州锐思科技', type: 'tax_filing', title: '4月增值税申报', deadline: '2026-04-30', status: 'in_progress', priority: 'high', assignedTo: '李会计' },
  { id: 't2', customerId: 'c2', customerName: '宁波海川贸易', type: 'tax_filing', title: '4月出口退税申报', deadline: '2026-04-30', status: 'pending', priority: 'high', assignedTo: '赵会计' },
  { id: 't3', customerId: 'c4', customerName: '浙江绿源环保', type: 'annual_report', title: '2025年度汇算清缴', deadline: '2026-05-31', status: 'pending', priority: 'medium', assignedTo: '赵会计' },
  { id: 't4', customerId: 'c3', customerName: '杭州味道餐饮', type: 'tax_filing', title: '4月个税申报', deadline: '2026-04-30', status: 'overdue', priority: 'high', assignedTo: '李会计' },
  { id: 't5', customerId: 'c5', customerName: '温州鑫达五金', type: 'license_renewal', title: '营业执照年检', deadline: '2026-06-30', status: 'pending', priority: 'low', assignedTo: '李会计' },
  { id: 't6', customerId: 'c7', customerName: '嘉兴恒泰建材', type: 'social_security', title: '社保基数调整申报', deadline: '2026-07-15', status: 'pending', priority: 'medium', assignedTo: '李会计' },
  { id: 't7', customerId: 'c6', customerName: '杭州云帆网络', type: 'tax_filing', title: 'Q1企业所得税预缴', deadline: '2026-04-25', status: 'completed', priority: 'high', assignedTo: '赵会计' },
  { id: 't8', customerId: 'c1', customerName: '杭州锐思科技', type: 'other', title: '高新企业复审材料准备', deadline: '2026-05-20', status: 'pending', priority: 'medium', assignedTo: '李会计' },
  { id: 't9', customerId: 'c8', customerName: '义乌锦绣电商', type: 'tax_filing', title: '4月增值税申报', deadline: '2026-04-30', status: 'pending', priority: 'medium', assignedTo: '赵会计' },
  { id: 't10', customerId: 'c2', customerName: '宁波海川贸易', type: 'invoice', title: '增值税专用发票领购', deadline: '2026-04-28', status: 'pending', priority: 'medium', assignedTo: '赵会计' },
];

/* ── AI商机 ───────────────────────────────────── */
export const OPPORTUNITIES: Opportunity[] = [
  {
    id: 'o1', customerId: 'c1', customerName: '杭州锐思科技',
    service: '税务筹划', reason: '营收连续6个月增长超15%，现有税负率偏高(8.2%)，通过研发费用加计扣除可节税约¥12万/年',
    estimatedValue: 18000, confidence: 89, status: 'new', createdAt: '2026-04-22',
    suggestedTalk: '张总您好，锐思今年业务增长很快，我们注意到税负率有优化空间。研发费用加计扣除政策可以帮你们省不少，要不我出个方案给您看看？',
  },
  {
    id: 'o2', customerId: 'c5', customerName: '温州鑫达五金',
    service: '一般纳税人资格认定', reason: '近3个月开票量激增(月均¥42万)，即将达到小规模纳税人500万年限额，建议主动转为一般纳税人',
    estimatedValue: 6000, confidence: 92, status: 'new', createdAt: '2026-04-21',
    suggestedTalk: '林总，鑫达最近生意不错！按现在的开票量，很快就到500万的线了。主动转一般纳税人比被强制转划算，我帮你算算？',
  },
  {
    id: 'o3', customerId: 'c3', customerName: '杭州味道餐饮',
    service: '社保代缴', reason: '企业有12名员工但未开通社保代缴服务，存在用工合规风险',
    estimatedValue: 3600, confidence: 75, status: 'following', createdAt: '2026-04-18',
    suggestedTalk: '刘总，味道餐饮现在十几个员工了，社保这块合规越来越严，我们可以帮你把社保代缴一起做了，省心也避免被查。',
  },
  {
    id: 'o4', customerId: 'c6', customerName: '杭州云帆网络',
    service: '高新企业认定', reason: '企业成立满3年，研发人员占比32%，有多项软件著作权，符合高新企业认定条件，可享15%企业所得税优惠',
    estimatedValue: 25000, confidence: 85, status: 'new', createdAt: '2026-04-22',
    suggestedTalk: '孙总，云帆现在条件很适合申请高新企业认定，所得税从25%降到15%，一年能省好几万。我们高新认定通过率很高的。',
  },
  {
    id: 'o5', customerId: 'c7', customerName: '嘉兴恒泰建材',
    service: '审计服务', reason: '企业成立7年从未做过年度审计，注册资本800万，建议补做近两年审计报告',
    estimatedValue: 12000, confidence: 70, status: 'new', createdAt: '2026-04-20',
    suggestedTalk: '周总，恒泰成立好几年了一直没做审计，现在银行贷款、招投标都要看审计报告的。趁现在补一下，后面需要的时候就不慌了。',
  },
  {
    id: 'o6', customerId: 'c2', customerName: '宁波海川贸易',
    service: '进出口退税筹划', reason: '当前退税率适用不够精准，部分商品可能适用更高退税率，预估年增退税额¥8.5万',
    estimatedValue: 15000, confidence: 78, status: 'following', createdAt: '2026-04-15',
    suggestedTalk: '王总，我们最近梳理了海川的出口退税明细，发现有几个品类可能适用更高的退税率。如果调整一下，一年能多退大概八九万。',
  },
];

/* ── 政策雷达 ─────────────────────────────────── */
export const POLICIES: PolicyAlert[] = [
  {
    id: 'p1', title: '小微企业增值税减免政策延续至2027年底',
    source: '国家税务总局', publishDate: '2026-04-20',
    summary: '对月销售额10万元以下的增值税小规模纳税人免征增值税，10万以上减按1%征收率。该政策原定2026年底到期，现延续至2027年12月31日。',
    impact: 'high', affectedCount: 3, affectedCustomerIds: ['c3', 'c5', 'c8'],
    category: 'tax', actionSuggestion: '通知所有小规模纳税人客户，政策继续有效，帮助客户做好税务规划。可作为客户关怀触点。',
    isRead: false,
  },
  {
    id: 'p2', title: '2026年社保缴费基数调整通知',
    source: '浙江省人力资源和社会保障厅', publishDate: '2026-04-18',
    summary: '自2026年7月1日起调整社保缴费基数上下限。下限由4462元/月调整为4812元/月，上限由22310元/月调整为24060元/月。',
    impact: 'high', affectedCount: 6, affectedCustomerIds: ['c1', 'c2', 'c4', 'c6', 'c7', 'c8'],
    category: 'social_security', actionSuggestion: '7月前通知所有按下限缴费的客户，每人每月社保成本将增加约¥120。帮客户重新核算成本，同时推荐社保代缴服务。',
    isRead: false,
  },
  {
    id: 'p3', title: '研发费用加计扣除比例提至120%',
    source: '财政部 税务总局', publishDate: '2026-04-15',
    summary: '自2026年1月1日起，企业研发费用税前加计扣除比例由100%统一提高至120%。适用于所有企业，不再区分制造业和非制造业。',
    impact: 'medium', affectedCount: 3, affectedCustomerIds: ['c1', 'c4', 'c6'],
    category: 'tax', actionSuggestion: '重点通知有研发活动的科技企业客户，协助梳理可归集的研发费用，最大化享受政策红利。这是推荐税务筹划服务的好时机。',
    isRead: true,
  },
  {
    id: 'p4', title: '电子发票全面推广时间表公布',
    source: '国家税务总局', publishDate: '2026-04-10',
    summary: '自2026年9月1日起，全面推行增值税全电发票。届时纸质发票将逐步停止供应。企业需在8月底前完成开票系统升级。',
    impact: 'medium', affectedCount: 8, affectedCustomerIds: ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8'],
    category: 'tax', actionSuggestion: '所有客户都需要了解。分批通知客户准备系统升级，可提供全电发票培训和系统对接服务作为增值服务。',
    isRead: true,
  },
];

/* ── 客户动态 ─────────────────────────────────── */
export const CUSTOMER_EVENTS: CustomerEvent[] = [
  { id: 'e1', customerId: 'c1', customerName: '杭州锐思科技', type: 'contact', title: '电话回访完成', description: '与张建国确认4月增值税申报材料，已收到全部票据。', timestamp: '2026-04-21 14:30', source: '手动记录' },
  { id: 'e2', customerId: 'c1', customerName: '杭州锐思科技', type: 'change', title: '工商信息变更', description: 'AI监测到经营范围新增"人工智能技术服务"，有利于高新企业复审。', timestamp: '2026-04-20 09:15', source: 'AI监控' },
  { id: 'e3', customerId: 'c2', customerName: '宁波海川贸易', type: 'risk', title: '账款逾期预警', description: '检测到2笔超90天应收账款(合计¥38.5万)，建议关注客户资金状况。', timestamp: '2026-04-19 16:00', source: 'AI分析' },
  { id: 'e4', customerId: 'c3', customerName: '杭州味道餐饮', type: 'risk', title: '失联预警', description: '已超过60天未联系，上次沟通时客户提到"考虑自己做账"，流失风险高。', timestamp: '2026-04-18 10:00', source: 'AI预警' },
  { id: 'e5', customerId: 'c4', customerName: '浙江绿源环保', type: 'opportunity', title: '上市辅导进展', description: '客户已启动IPO辅导，预计需要审计、内控、税务合规等全套服务。', timestamp: '2026-04-22 11:30', source: '客户反馈' },
  { id: 'e6', customerId: 'c5', customerName: '温州鑫达五金', type: 'change', title: '开票量激增', description: '近3个月累计开票¥126万，按此速度年内将超过500万小规模限额。', timestamp: '2026-04-21 08:45', source: 'AI分析' },
  { id: 'e7', customerId: 'c6', customerName: '杭州云帆网络', type: 'service', title: 'Q1所得税预缴完成', description: '已完成2026年Q1企业所得税预缴申报，实缴¥3.2万。', timestamp: '2026-04-25 09:00', source: '赵会计' },
  { id: 'e8', customerId: 'c7', customerName: '嘉兴恒泰建材', type: 'change', title: '法人代表变更', description: 'AI监测到法人代表由"周国强"变更为"周建明"，属于正常代际交接。', timestamp: '2026-04-15 14:20', source: 'AI监控' },
  { id: 'e9', customerId: 'c8', customerName: '义乌锦绣电商', type: 'contact', title: '新客户首次回访', description: '确认记账需求，客户主要做跨境电商(亚马逊+速卖通)，月发货量约2000单。', timestamp: '2026-04-19 15:00', source: '赵会计' },
  { id: 'e10', customerId: 'c4', customerName: '浙江绿源环保', type: 'policy', title: '研发加计扣除利好', description: '加计扣除比例提至120%，预计可为客户额外节税约¥25万。已安排赵会计对接。', timestamp: '2026-04-16 10:30', source: 'AI匹配' },
  { id: 'e11', customerId: 'c2', customerName: '宁波海川贸易', type: 'contact', title: '微信沟通', description: '王丽芳咨询4月出口退税流程，已发送所需材料清单。', timestamp: '2026-04-17 11:20', source: '手动记录' },
  { id: 'e12', customerId: 'c7', customerName: '嘉兴恒泰建材', type: 'risk', title: '税务异常提醒', description: '检测到连续3个月进项抵扣率超95%，存在被税务稽查风险。建议核实。', timestamp: '2026-04-12 09:00', source: 'AI监控' },
];

/* ── AI监控规则 ────────────────────────────────── */
export const MONITOR_RULES: MonitorRule[] = [
  { id: 'r1', name: '工商变更监控', type: 'business_change', description: '每日扫描天眼查/企查查，监控客户企业的法人、股权、经营范围、注册地址等工商信息变更。', frequency: 'daily', enabled: true, lastRun: '2026-04-24 06:00', affectedCustomerIds: ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8'] },
  { id: 'r2', name: '税务风险预警', type: 'tax_anomaly', description: '分析客户纳税数据，检测进项异常、税负率偏离、连续零申报等税务风险信号。', frequency: 'weekly', enabled: true, lastRun: '2026-04-21 00:00', affectedCustomerIds: ['c1', 'c2', 'c4', 'c6', 'c7'] },
  { id: 'r3', name: '网络舆情监控', type: 'public_opinion', description: '搜索互联网上关于客户企业的新闻、公告、投诉，及时发现潜在风险或商机。', frequency: 'daily', enabled: true, lastRun: '2026-04-24 07:30', affectedCustomerIds: ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8'] },
  { id: 'r4', name: '证照到期提醒', type: 'license_expiry', description: '跟踪客户企业的营业执照、行业许可证、资质证书等到期时间，提前60天预警。', frequency: 'weekly', enabled: true, lastRun: '2026-04-21 00:00', affectedCustomerIds: ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8'] },
  { id: 'r5', name: '法律风险扫描', type: 'legal_risk', description: '定期查询客户企业的诉讼、仲裁、行政处罚等法律信息，发现潜在法律风险。', frequency: 'weekly', enabled: false, lastRun: '2026-04-14 00:00', affectedCustomerIds: ['c1', 'c2', 'c4', 'c7'] },
];

export const MONITOR_ALERTS: MonitorAlert[] = [
  { id: 'a1', ruleId: 'r1', ruleName: '工商变更监控', customerId: 'c1', customerName: '杭州锐思科技', type: 'business_change', severity: 'info', title: '经营范围变更', detail: '新增经营范围："人工智能技术服务、智能机器人研发"。变更日期2026-04-18，已在市场监管局完成备案。该变更有利于高新企业复审申请。', source: '天眼查', discoveredAt: '2026-04-20 09:15', isHandled: true },
  { id: 'a2', ruleId: 'r2', ruleName: '税务风险预警', customerId: 'c7', customerName: '嘉兴恒泰建材', type: 'tax_anomaly', severity: 'warning', title: '进项抵扣率异常', detail: '近3个月进项税额抵扣率分别为96.2%、97.1%、95.8%，显著高于建材行业平均水平(78%)。连续高抵扣率可能触发税务稽查关注，建议核实供应商发票真实性。', source: 'AI税务分析', discoveredAt: '2026-04-21 08:00', isHandled: false },
  { id: 'a3', ruleId: 'r1', ruleName: '工商变更监控', customerId: 'c7', customerName: '嘉兴恒泰建材', type: 'business_change', severity: 'info', title: '法人代表变更', detail: '法人代表由"周国强"变更为"周建明"（原法人之子）。变更日期2026-04-10。属于正常的家族企业代际交接，建议安排一次拜访以巩固客户关系。', source: '企查查', discoveredAt: '2026-04-15 14:20', isHandled: true },
  { id: 'a4', ruleId: 'r3', ruleName: '网络舆情监控', customerId: 'c4', customerName: '浙江绿源环保', type: 'public_opinion', severity: 'info', title: '正面新闻报道', detail: '《浙江日报》报道"绿源环保获省级绿色工厂认定"，有利于企业品牌形象和融资。可结合此新闻为客户推荐ESG报告编制服务。', source: '百度新闻', discoveredAt: '2026-04-23 10:00', isHandled: false },
  { id: 'a5', ruleId: 'r2', ruleName: '税务风险预警', customerId: 'c3', customerName: '杭州味道餐饮', type: 'tax_anomaly', severity: 'critical', title: '连续零申报预警', detail: '该企业近2个月增值税连续零申报，但银行流水显示仍有经营收入。可能存在漏报风险，若被税务机关发现将面临补税和罚款。建议立即联系客户核实。', source: 'AI税务分析', discoveredAt: '2026-04-22 09:30', isHandled: false },
  { id: 'a6', ruleId: 'r4', ruleName: '证照到期提醒', customerId: 'c3', customerName: '杭州味道餐饮', type: 'license_expiry', severity: 'warning', title: '食品经营许可证即将到期', detail: '食品经营许可证（编号JY133010XXXXX）将于2026-06-15到期，距今不足60天。需提前准备续期材料，逾期将无法继续经营。', source: '证照管理系统', discoveredAt: '2026-04-20 00:00', isHandled: false },
  { id: 'a7', ruleId: 'r3', ruleName: '网络舆情监控', customerId: 'c2', customerName: '宁波海川贸易', type: 'public_opinion', severity: 'warning', title: '客户被列入经营异常名录', detail: '海川贸易因未按期公示2025年度报告被列入经营异常名录。需在30日内补报并申请移出，否则将影响企业信用。建议立即通知客户。', source: '国家企业信用信息公示系统', discoveredAt: '2026-04-23 15:00', isHandled: false },
];

/* ── 导入示例字段映射 ────────────────────────── */
export const SAMPLE_IMPORT_FIELDS: ImportField[] = [
  { original: '公司名称', mapped: 'name', sample: '杭州新创科技有限公司', confidence: 98 },
  { original: '统一社会信用代码', mapped: 'taxId', sample: '91330100MAXXXXXX', confidence: 95 },
  { original: '负责人', mapped: 'contact', sample: '李明', confidence: 88 },
  { original: '手机', mapped: 'phone', sample: '138****5678', confidence: 96 },
  { original: '行业类别', mapped: 'industry', sample: '软件开发', confidence: 82 },
  { original: '地址', mapped: 'address', sample: '杭州市滨江区xxx路', confidence: 90 },
  { original: '注册资金', mapped: 'registeredCapital', sample: '200万', confidence: 85 },
];

/* ── 仪表盘汇总 ───────────────────────────────── */
export const DASHBOARD_STATS = {
  totalCustomers: CUSTOMERS.length,
  activeCustomers: CUSTOMERS.filter(c => c.status === 'active').length,
  attentionCustomers: CUSTOMERS.filter(c => c.status === 'attention').length,
  riskCustomers: CUSTOMERS.filter(c => c.status === 'risk').length,
  pendingTasks: TASKS.filter(t => t.status === 'pending' || t.status === 'in_progress').length,
  overdueTasks: TASKS.filter(t => t.status === 'overdue').length,
  newOpportunities: OPPORTUNITIES.filter(o => o.status === 'new').length,
  totalOpportunityValue: OPPORTUNITIES.reduce((s, o) => s + o.estimatedValue, 0),
  unreadPolicies: POLICIES.filter(p => !p.isRead).length,
  monthlyRevenue: 15800,
  avgHealthScore: Math.round(CUSTOMERS.reduce((s, c) => s + c.healthScore, 0) / CUSTOMERS.length),
};
