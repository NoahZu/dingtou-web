/**
 * 复盘模板配置
 * 来自 investment-plan-v1.1.md 第 8 节
 */

export interface ChecklistItem {
  id: string;
  label: string;
}

// 月度复盘模板（文档 8.1 节）
export const MONTHLY_CHECKLIST: ChecklistItem[] = [
  { id: 'm1', label: '检查 5 只收息股股息率' },
  { id: 'm2', label: '判断触发 + 累积账户处理' },
  { id: 'm3', label: '检查大盘是否暴跌' },
  { id: 'm4', label: '执行 ETF 定投 ¥15,000' },
  { id: 'm5', label: '检查富途加仓触发' },
  { id: 'm6', label: '记录本月操作' },
];

// 季度复盘模板（文档 8.2 节）
export const QUARTERLY_CHECKLIST: ChecklistItem[] = [
  { id: 'q1', label: '总资产变化：对比上季度 ±%' },
  { id: 'q2', label: '各账户余额核对（富途/雪球/微众）' },
  { id: 'q3', label: '资产配置比例检查（三大红线）' },
  { id: 'q4', label: '各池子余额核对' },
  { id: 'q5', label: '累积账户状态（5 只标的）' },
  { id: 'q6', label: '本季度定投是否按计划执行（应执行 3 次）' },
  { id: 'q7', label: '本季度触发的特殊操作记录' },
  { id: 'q8', label: '心理日记：本季度市场我有没有焦虑？为什么？' },
  { id: 'q9', label: '是否需要调整下季度规则？' },
];

// 年度审视模板（文档 8.3 节）
export const YEARLY_CHECKLIST: ChecklistItem[] = [
  { id: 'y1', label: '全年总收益率 vs 业绩基准（恒生+纳指均值）' },
  { id: 'y2', label: '定投系统贡献分析' },
  { id: 'y3', label: '价值仓贡献分析' },
  { id: 'y4', label: '收息股贡献分析（含分红 + 资本利得）' },
  { id: 'y5', label: '收息股年报检查（净利润/现金流/分红/派息率）' },
  { id: 'y6', label: '更新收息股触发价（基于新年分红）' },
  { id: 'y7', label: '是否需要扩展/淘汰标的' },
  { id: 'y8', label: '工资是否增长 → 调整月度定投金额' },
  { id: 'y9', label: '池子规模是否需要扩容' },
  { id: 'y10', label: '撰写年度投资总结' },
];

export function getTemplateByPeriod(period: 'monthly' | 'quarterly' | 'yearly'): ChecklistItem[] {
  switch (period) {
    case 'monthly': return MONTHLY_CHECKLIST;
    case 'quarterly': return QUARTERLY_CHECKLIST;
    case 'yearly': return YEARLY_CHECKLIST;
  }
}

export function getPeriodLabel(period: 'monthly' | 'quarterly' | 'yearly'): string {
  switch (period) {
    case 'monthly': return '月度复盘';
    case 'quarterly': return '季度复盘';
    case 'yearly': return '年度审视';
  }
}
