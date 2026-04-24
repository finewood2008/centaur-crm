import { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, Sparkles, ArrowRight } from 'lucide-react';
import { SAMPLE_IMPORT_FIELDS, CUSTOMERS } from '../mock';
import type { ImportField } from '../types';
import { Card, Badge, Button, SectionHeader } from '../components/ui';

type ImportStage = 'idle' | 'parsing' | 'preview' | 'importing' | 'done';

const CRM_FIELD_LABELS: Record<string, string> = {
  name: '企业名称',
  taxId: '税号',
  contact: '联系人',
  phone: '电话',
  industry: '行业',
  address: '地址',
  registeredCapital: '注册资金',
};

const PLACEHOLDER = `在此粘贴客户数据，支持多种格式：

CSV 格式：
公司名称,统一社会信用代码,负责人,手机,行业类别
杭州新创科技有限公司,91330100MAXXXXXX,李明,138****5678,软件开发

Excel 复制格式（Tab 分隔）：
公司名称\t信用代码\t联系人\t电话
杭州新创科技\t91330100MA...\t李明\t138****5678

也可直接拖拽 .csv / .xlsx 文件到此区域`;

export default function Import() {
  const [stage, setStage] = useState<ImportStage>('idle');
  const [pasteText, setPasteText] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [fields] = useState<ImportField[]>(SAMPLE_IMPORT_FIELDS);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const summary = {
    totalRows: 24,
    newCustomers: 18,
    duplicates: 4,
    warnings: [
      '第 8 行"注册资金"格式异常，已自动修正为"150万"',
      '第 15 行"手机"缺失，建议后续补充',
      '第 21 行企业名称与现有客户「杭州锐思科技有限公司」高度相似',
    ],
  };

  useEffect(() => {
    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, []);

  const startParsing = useCallback(() => {
    if (!pasteText.trim() && !fileName) return;
    setStage('parsing');
    setTimeout(() => {
      setStage('preview');
    }, 2000);
  }, [pasteText, fileName]);

  const startImport = useCallback(() => {
    setStage('importing');
    setProgress(0);
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setStage('done');
          return 100;
        }
        return prev + 4;
      });
    }, 80);
    progressTimerRef.current = timer;
  }, []);

  const reset = useCallback(() => {
    setStage('idle');
    setPasteText('');
    setFileName(null);
    setProgress(0);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setFileName(file.name);
      setPasteText(`[文件] ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setPasteText(`[文件] ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
    }
  }, []);

  const confidenceBadgeVariant = (c: number): 'ok' | 'warn' | 'bad' => {
    if (c >= 90) return 'ok';
    if (c >= 80) return 'warn';
    return 'bad';
  };

  const stageOrder: ImportStage[] = ['idle', 'parsing', 'preview', 'importing', 'done'];
  const currentIdx = stageOrder.indexOf(stage);

  const steps = [
    { key: 'idle', label: '上传数据', icon: Upload },
    { key: 'parsing', label: 'AI 解析', icon: Sparkles },
    { key: 'preview', label: '确认映射', icon: CheckCircle2 },
    { key: 'done', label: '导入完成', icon: CheckCircle2 },
  ];

  return (
    <div className="p-6 max-w-[1100px] mx-auto anim-fade-in">
      {/* Header */}
      <SectionHeader
        icon={<FileSpreadsheet size={18} className="text-[var(--color-accent)]" />}
        title="智能导入"
      />
      <p className="text-sm mb-5" style={{ color: 'var(--color-t3)' }}>
        AI 自动识别数据格式，智能匹配 CRM 字段，一键导入客户数据
      </p>

      {/* Progress steps */}
      <Card padding="md" className="mb-6">
        <div className="flex items-center justify-between max-w-xl mx-auto">
          {steps.map((step, i, arr) => {
            const stepIdx = step.key === 'done' ? 4 : stageOrder.indexOf(step.key as ImportStage);
            const isCompleted = currentIdx > stepIdx;
            const isActive = currentIdx === stepIdx || (stage === 'importing' && step.key === 'preview');
            const isReached = currentIdx >= stepIdx;
            const Icon = step.icon;

            return (
              <div key={step.key} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all"
                    style={{
                      background: isActive
                        ? 'var(--color-accent)'
                        : isCompleted
                          ? 'var(--color-surface-3)'
                          : 'var(--color-surface-1)',
                      color: isActive
                        ? '#fff'
                        : isCompleted
                          ? 'var(--color-accent)'
                          : 'var(--color-t4)',
                      boxShadow: isActive
                        ? '0 0 0 3px var(--color-accent-muted)'
                        : 'none',
                      border: isCompleted
                        ? '1px solid var(--color-b1)'
                        : isActive
                          ? 'none'
                          : '1px solid var(--color-b0)',
                    }}
                  >
                    <Icon size={15} />
                  </div>
                  <span
                    className="text-[11px] mt-1.5 font-medium"
                    style={{
                      color: isReached
                        ? 'var(--color-accent)'
                        : 'var(--color-t4)',
                    }}
                  >
                    {step.label}
                  </span>
                </div>
                {i < arr.length - 1 && (
                  <div
                    className="w-20 h-0.5 mx-3 mb-5 rounded-full transition-colors"
                    style={{
                      background: currentIdx > stepIdx
                        ? 'var(--color-accent)'
                        : 'var(--color-b0)',
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Stage: idle - paste/drop area */}
      {stage === 'idle' && (
        <Card padding="lg" className="anim-fade-up">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className="rounded-xl p-8 text-center transition-all cursor-pointer"
            style={{
              border: `2px dashed ${dragOver ? 'var(--color-accent)' : 'var(--color-b1)'}`,
              background: dragOver ? 'var(--color-accent-muted)' : 'transparent',
              boxShadow: dragOver ? '0 0 30px rgba(79,140,255,0.15)' : 'none',
            }}
          >
            <Upload
              size={36}
              className="mx-auto mb-3"
              style={{ color: 'var(--color-t4)' }}
            />
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-t2)' }}>
              拖拽文件到此处，或
              <button
                onClick={() => fileInputRef.current?.click()}
                className="underline ml-1 transition-colors text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]"
              >
                选择文件
              </button>
            </p>
            <p className="text-xs" style={{ color: 'var(--color-t4)' }}>
              支持 CSV、Excel、TXT 等格式
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: 'var(--color-b1)' }} />
            <span className="text-xs" style={{ color: 'var(--color-t4)' }}>或者直接粘贴数据</span>
            <div className="flex-1 h-px" style={{ background: 'var(--color-b1)' }} />
          </div>

          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder={PLACEHOLDER}
            className="w-full h-48 rounded-xl p-4 text-sm resize-none mono focus:outline-none transition-all
                       bg-[var(--color-surface-1)] border border-[var(--color-b1)] text-[var(--color-t2)]
                       focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
          />

          <div className="flex items-center justify-between mt-5">
            <p className="text-xs flex items-center gap-1.5" style={{ color: 'var(--color-t4)' }}>
              <Sparkles size={13} className="text-[var(--color-accent)]" />
              AI 将自动识别列名、分隔符、编码，并映射到 CRM 字段
            </p>
            <Button
              variant="primary"
              size="lg"
              disabled={!pasteText.trim()}
              onClick={startParsing}
            >
              <Sparkles size={15} />
              开始解析
            </Button>
          </div>
        </Card>
      )}

      {/* Stage: parsing - AI animation */}
      {stage === 'parsing' && (
        <Card padding="lg" className="p-12 text-center anim-fade-up">
          <div className="relative inline-flex items-center justify-center w-20 h-20 mb-5">
            <div
              className="absolute inset-0 rounded-full animate-ping opacity-20"
              style={{ border: '4px solid var(--color-accent-muted)' }}
            />
            <div
              className="absolute inset-2 rounded-full animate-pulse"
              style={{ border: '4px solid var(--color-accent)' }}
            />
            <Sparkles size={32} className="animate-pulse" style={{ color: 'var(--color-accent)' }} />
          </div>
          <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--color-t1)' }}>
            AI 正在解析数据...
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--color-t3)' }}>
            正在识别数据格式、提取字段、匹配 CRM 数据结构
          </p>
          <div className="max-w-sm mx-auto space-y-3 stagger">
            {[
              { label: '检测数据格式', delay: '0ms' },
              { label: '提取列名与样本', delay: '400ms' },
              { label: '智能字段映射', delay: '800ms' },
              { label: '检查重复与冲突', delay: '1200ms' },
            ].map((step) => (
              <div
                key={step.label}
                className="flex items-center gap-3 text-left shimmer rounded-lg px-3 py-2"
                style={{
                  animationDelay: step.delay,
                  animationFillMode: 'both',
                }}
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--color-accent-muted)' }}
                >
                  <div
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ background: 'var(--color-accent)' }}
                  />
                </div>
                <span className="text-sm" style={{ color: 'var(--color-t2)' }}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Stage: preview - field mapping & summary */}
      {(stage === 'preview' || stage === 'importing') && (
        <div className="space-y-5 anim-fade-up">
          {/* Field mapping table */}
          <Card padding="none" className="overflow-hidden">
            <div
              className="px-5 py-4 flex items-center gap-2"
              style={{ borderBottom: '1px solid var(--color-b0)' }}
            >
              <Sparkles size={16} style={{ color: 'var(--color-accent)' }} />
              <h2 className="text-sm font-bold" style={{ color: 'var(--color-t1)' }}>
                AI 字段映射结果
              </h2>
              <span className="text-xs ml-2" style={{ color: 'var(--color-t4)' }}>
                已自动匹配 {fields.length} 个字段
              </span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--color-surface-2)' }}>
                  <th
                    className="text-left py-3 px-5 font-medium text-xs"
                    style={{ color: 'var(--color-t3)' }}
                  >
                    原始列名
                  </th>
                  <th className="text-center py-3 px-5 font-medium w-12" />
                  <th
                    className="text-left py-3 px-5 font-medium text-xs"
                    style={{ color: 'var(--color-t3)' }}
                  >
                    CRM 字段
                  </th>
                  <th
                    className="text-left py-3 px-5 font-medium text-xs"
                    style={{ color: 'var(--color-t3)' }}
                  >
                    样本值
                  </th>
                  <th
                    className="text-center py-3 px-5 font-medium text-xs"
                    style={{ color: 'var(--color-t3)' }}
                  >
                    置信度
                  </th>
                </tr>
              </thead>
              <tbody className="stagger">
                {fields.map((f, i) => (
                  <tr
                    key={f.original}
                    style={{
                      borderTop: '1px solid var(--color-b0)',
                      background: i % 2 === 0 ? 'var(--color-surface-1)' : 'transparent',
                    }}
                  >
                    <td className="py-3 px-5 mono" style={{ color: 'var(--color-t2)' }}>
                      {f.original}
                    </td>
                    <td className="py-3 px-5 text-center">
                      <ArrowRight size={14} className="mx-auto" style={{ color: 'var(--color-accent)' }} />
                    </td>
                    <td className="py-3 px-5">
                      <Badge variant="accent">
                        {CRM_FIELD_LABELS[f.mapped] || f.mapped}
                      </Badge>
                    </td>
                    <td className="py-3 px-5 text-xs mono" style={{ color: 'var(--color-t3)' }}>
                      {f.sample}
                    </td>
                    <td className="py-3 px-5 text-center">
                      <Badge variant={confidenceBadgeVariant(f.confidence)}>
                        {f.confidence}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Import summary */}
          <Card padding="lg">
            <SectionHeader
              icon={<FileSpreadsheet size={16} className="text-[var(--color-accent)]" />}
              title="导入摘要"
            />
            <div className="grid grid-cols-3 gap-4 mb-5">
              <div
                className="rounded-lg p-4 text-center"
                style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-b0)' }}
              >
                <div className="metric" style={{ color: 'var(--color-t1)' }}>
                  {summary.totalRows}
                </div>
                <div className="text-xs mt-1" style={{ color: 'var(--color-t3)' }}>总行数</div>
              </div>
              <div
                className="rounded-lg p-4 text-center"
                style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}
              >
                <div className="metric" style={{ color: 'var(--color-ok)' }}>
                  {summary.newCustomers}
                </div>
                <div className="text-xs mt-1" style={{ color: 'var(--color-ok)' }}>新客户</div>
              </div>
              <div
                className="rounded-lg p-4 text-center"
                style={{ background: 'rgba(236,126,0,0.08)', border: '1px solid rgba(236,126,0,0.15)' }}
              >
                <div className="metric" style={{ color: 'var(--color-warn)' }}>
                  {summary.duplicates}
                </div>
                <div className="text-xs mt-1" style={{ color: 'var(--color-warn)' }}>疑似重复</div>
              </div>
            </div>

            {/* Warnings */}
            {summary.warnings.length > 0 && (
              <div
                className="rounded-lg p-4"
                style={{
                  background: 'rgba(236,126,0,0.06)',
                  border: '1px solid rgba(236,126,0,0.12)',
                }}
              >
                <h3
                  className="text-xs font-bold mb-2 flex items-center gap-1.5"
                  style={{ color: 'var(--color-warn)' }}
                >
                  <AlertTriangle size={13} />
                  注意事项 ({summary.warnings.length})
                </h3>
                <ul className="space-y-1.5">
                  {summary.warnings.map((w, i) => (
                    <li
                      key={i}
                      className="text-xs flex items-start gap-2"
                      style={{ color: 'rgba(236,126,0,0.85)' }}
                    >
                      <span className="mt-0.5 shrink-0" style={{ color: 'var(--color-warn)' }}>•</span>
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Existing customers */}
            <div
              className="mt-4 pt-4"
              style={{ borderTop: '1px solid var(--color-b0)' }}
            >
              <h3 className="text-xs font-medium mb-2" style={{ color: 'var(--color-t3)' }}>
                现有客户库：{CUSTOMERS.length} 个客户（用于去重比对）
              </h3>
              <div className="flex flex-wrap gap-2">
                {CUSTOMERS.slice(0, 4).map(c => (
                  <Badge key={c.id} variant="default">
                    {c.name}
                  </Badge>
                ))}
                {CUSTOMERS.length > 4 && (
                  <span className="text-xs px-2 py-1" style={{ color: 'var(--color-t4)' }}>
                    +{CUSTOMERS.length - 4} 个
                  </span>
                )}
              </div>
            </div>
          </Card>

          {/* Import progress bar */}
          {stage === 'importing' && (
            <Card padding="lg" className="anim-fade-in">
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-sm font-medium flex items-center gap-2"
                  style={{ color: 'var(--color-t2)' }}
                >
                  <Sparkles
                    size={15}
                    className="animate-pulse"
                    style={{ color: 'var(--color-accent)' }}
                  />
                  正在导入...
                </span>
                <span className="text-sm font-bold mono" style={{ color: 'var(--color-accent)' }}>
                  {Math.min(progress, 100)}%
                </span>
              </div>
              <div
                className="w-full h-2.5 rounded-full overflow-hidden"
                style={{ background: 'var(--color-surface-2)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-200 ease-out"
                  style={{
                    width: `${Math.min(progress, 100)}%`,
                    background: 'linear-gradient(90deg, var(--color-accent), var(--color-accent))',
                  }}
                />
              </div>
              <p className="text-xs mt-2" style={{ color: 'var(--color-t4)' }}>
                正在写入 {Math.min(Math.round((progress / 100) * summary.totalRows), summary.totalRows)} / {summary.totalRows} 条记录...
              </p>
            </Card>
          )}

          {/* Action buttons */}
          {stage === 'preview' && (
            <div className="flex items-center justify-end gap-3">
              <Button variant="secondary" onClick={reset}>
                取消
              </Button>
              <Button variant="primary" onClick={startImport}>
                <CheckCircle2 size={15} />
                确认导入 {summary.newCustomers} 个新客户
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Stage: done - success */}
      {stage === 'done' && (
        <Card padding="lg" className="p-12 text-center anim-fade-up">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-5"
            style={{ background: 'rgba(16,185,129,0.12)' }}
          >
            <CheckCircle2 size={32} style={{ color: 'var(--color-ok)' }} />
          </div>
          <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--color-t1)' }}>
            导入完成！
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--color-t3)' }}>
            成功导入{' '}
            <span className="font-bold" style={{ color: 'var(--color-ok)' }}>
              {summary.newCustomers}
            </span>{' '}
            个新客户，跳过{' '}
            <span className="font-bold" style={{ color: 'var(--color-warn)' }}>
              {summary.duplicates}
            </span>{' '}
            个重复项
          </p>
          <div
            className="inline-flex items-center gap-4 rounded-xl px-6 py-4 mb-6"
            style={{
              background: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.15)',
            }}
          >
            <div className="text-left">
              <div className="text-xs mb-0.5" style={{ color: 'var(--color-ok)' }}>
                客户总数已更新
              </div>
              <div className="metric" style={{ color: 'var(--color-ok)' }}>
                {CUSTOMERS.length} → {CUSTOMERS.length + summary.newCustomers}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Button variant="secondary" onClick={reset}>
              继续导入
            </Button>
            <Button variant="primary">
              查看客户列表
              <ArrowRight size={15} />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
