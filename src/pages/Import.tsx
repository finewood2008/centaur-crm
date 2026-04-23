import { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, Sparkles, ArrowRight } from 'lucide-react';
import { SAMPLE_IMPORT_FIELDS, CUSTOMERS } from '../mock';
import type { ImportField } from '../types';

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

  // Simulated import summary
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

  // Clean up interval on unmount
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

  const confidenceColor = (c: number) => {
    if (c >= 90) return 'text-emerald-600 bg-emerald-50';
    if (c >= 80) return 'text-amber-600 bg-amber-50';
    return 'text-red-500 bg-red-50';
  };

  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <FileSpreadsheet size={22} className="text-violet-600" /> 智能导入
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          AI 自动识别数据格式，智能匹配 CRM 字段，一键导入客户数据
        </p>
      </div>

      {/* Progress steps */}
      <div className="bg-white rounded-xl border border-slate-100 p-4 mb-6">
        <div className="flex items-center justify-between max-w-xl mx-auto">
          {[
            { key: 'idle', label: '上传数据', icon: Upload },
            { key: 'parsing', label: 'AI 解析', icon: Sparkles },
            { key: 'preview', label: '确认映射', icon: CheckCircle2 },
            { key: 'done', label: '导入完成', icon: CheckCircle2 },
          ].map((step, i, arr) => {
            const stageOrder: ImportStage[] = ['idle', 'parsing', 'preview', 'importing', 'done'];
            const currentIdx = stageOrder.indexOf(stage);
            const stepIdx = step.key === 'done' ? 4 : stageOrder.indexOf(step.key as ImportStage);
            const isActive = currentIdx >= stepIdx;
            const isCurrent = step.key === stage || (stage === 'importing' && step.key === 'preview');
            const Icon = step.icon;

            return (
              <div key={step.key} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-violet-600 text-white'
                        : 'bg-slate-100 text-slate-400'
                    } ${isCurrent ? 'ring-2 ring-violet-200' : ''}`}
                  >
                    <Icon size={15} />
                  </div>
                  <span
                    className={`text-[11px] mt-1.5 ${
                      isActive ? 'text-violet-600 font-medium' : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {i < arr.length - 1 && (
                  <div
                    className={`w-20 h-0.5 mx-3 mb-5 ${
                      currentIdx > stepIdx ? 'bg-violet-400' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stage: idle - paste/drop area */}
      {stage === 'idle' && (
        <div className="bg-white rounded-xl border border-slate-100 p-6">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragOver
                ? 'border-violet-400 bg-violet-50'
                : 'border-slate-200 hover:border-violet-300'
            }`}
          >
            <Upload size={36} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-medium text-slate-700 mb-1">
              拖拽文件到此处，或
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-violet-600 hover:text-violet-700 underline ml-1"
              >
                选择文件
              </button>
            </p>
            <p className="text-xs text-slate-400">支持 CSV、Excel、TXT 等格式</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400">或者直接粘贴数据</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder={PLACEHOLDER}
            className="w-full h-48 rounded-xl border border-slate-200 p-4 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300 resize-none font-mono"
          />

          <div className="flex items-center justify-between mt-5">
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <Sparkles size={13} className="text-violet-500" />
              AI 将自动识别列名、分隔符、编码，并映射到 CRM 字段
            </p>
            <button
              onClick={startParsing}
              disabled={!pasteText.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Sparkles size={15} />
              开始解析
            </button>
          </div>
        </div>
      )}

      {/* Stage: parsing - AI animation */}
      {stage === 'parsing' && (
        <div className="bg-white rounded-xl border border-slate-100 p-12 text-center">
          <div className="relative inline-flex items-center justify-center w-20 h-20 mb-5">
            <div className="absolute inset-0 rounded-full border-4 border-violet-100 animate-ping opacity-30" />
            <div className="absolute inset-2 rounded-full border-4 border-violet-200 animate-pulse" />
            <Sparkles size={32} className="text-violet-600 animate-pulse" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">AI 正在解析数据...</h2>
          <p className="text-sm text-slate-500 mb-6">
            正在识别数据格式、提取字段、匹配 CRM 数据结构
          </p>
          <div className="max-w-sm mx-auto space-y-3">
            {[
              { label: '检测数据格式', delay: '0ms' },
              { label: '提取列名与样本', delay: '400ms' },
              { label: '智能字段映射', delay: '800ms' },
              { label: '检查重复与冲突', delay: '1200ms' },
            ].map((step) => (
              <div
                key={step.label}
                className="flex items-center gap-3 text-left animate-fadeIn"
                style={{ animationDelay: step.delay, animationFillMode: 'both' }}
              >
                <div className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                </div>
                <span className="text-sm text-slate-600">{step.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stage: preview - field mapping & summary */}
      {(stage === 'preview' || stage === 'importing') && (
        <div className="space-y-5">
          {/* Field mapping table */}
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <Sparkles size={16} className="text-violet-500" />
              <h2 className="text-sm font-bold text-slate-900">AI 字段映射结果</h2>
              <span className="text-xs text-slate-400 ml-2">
                已自动匹配 {fields.length} 个字段
              </span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs">
                  <th className="text-left py-3 px-5 font-medium">原始列名</th>
                  <th className="text-center py-3 px-5 font-medium w-12" />
                  <th className="text-left py-3 px-5 font-medium">CRM 字段</th>
                  <th className="text-left py-3 px-5 font-medium">样本值</th>
                  <th className="text-center py-3 px-5 font-medium">置信度</th>
                </tr>
              </thead>
              <tbody>
                {fields.map((f, i) => (
                  <tr
                    key={f.original}
                    className={`border-t border-slate-50 ${
                      i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                    }`}
                  >
                    <td className="py-3 px-5 font-mono text-slate-700">{f.original}</td>
                    <td className="py-3 px-5 text-center">
                      <ArrowRight size={14} className="text-violet-400 mx-auto" />
                    </td>
                    <td className="py-3 px-5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-50 text-violet-700 rounded-md text-xs font-medium">
                        {CRM_FIELD_LABELS[f.mapped] || f.mapped}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-slate-500 text-xs font-mono">{f.sample}</td>
                    <td className="py-3 px-5 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${confidenceColor(
                          f.confidence
                        )}`}
                      >
                        {f.confidence}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Import summary */}
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileSpreadsheet size={16} className="text-violet-500" />
              导入摘要
            </h2>
            <div className="grid grid-cols-3 gap-4 mb-5">
              <div className="bg-slate-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-slate-900">{summary.totalRows}</div>
                <div className="text-xs text-slate-500 mt-1">总行数</div>
              </div>
              <div className="bg-emerald-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-emerald-600">{summary.newCustomers}</div>
                <div className="text-xs text-emerald-600 mt-1">新客户</div>
              </div>
              <div className="bg-amber-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-amber-600">{summary.duplicates}</div>
                <div className="text-xs text-amber-600 mt-1">疑似重复</div>
              </div>
            </div>

            {/* Warnings */}
            {summary.warnings.length > 0 && (
              <div className="bg-amber-50/60 rounded-lg border border-amber-100 p-4">
                <h3 className="text-xs font-bold text-amber-700 mb-2 flex items-center gap-1.5">
                  <AlertTriangle size={13} />
                  注意事项 ({summary.warnings.length})
                </h3>
                <ul className="space-y-1.5">
                  {summary.warnings.map((w, i) => (
                    <li key={i} className="text-xs text-amber-700 flex items-start gap-2">
                      <span className="text-amber-400 mt-0.5">•</span>
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Existing customers that might conflict */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-medium text-slate-500 mb-2">
                现有客户库：{CUSTOMERS.length} 个客户（用于去重比对）
              </h3>
              <div className="flex flex-wrap gap-2">
                {CUSTOMERS.slice(0, 4).map(c => (
                  <span
                    key={c.id}
                    className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md"
                  >
                    {c.name}
                  </span>
                ))}
                {CUSTOMERS.length > 4 && (
                  <span className="text-xs text-slate-400 px-2 py-1">
                    +{CUSTOMERS.length - 4} 个
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Import progress bar (during importing) */}
          {stage === 'importing' && (
            <div className="bg-white rounded-xl border border-slate-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Sparkles size={15} className="text-violet-500 animate-pulse" />
                  正在导入...
                </span>
                <span className="text-sm font-bold text-violet-600">{Math.min(progress, 100)}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-violet-600 rounded-full transition-all duration-200 ease-out"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">
                正在写入 {Math.min(Math.round((progress / 100) * summary.totalRows), summary.totalRows)} / {summary.totalRows} 条记录...
              </p>
            </div>
          )}

          {/* Action buttons */}
          {stage === 'preview' && (
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={reset}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={startImport}
                className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors"
              >
                <CheckCircle2 size={15} />
                确认导入 {summary.newCustomers} 个新客户
              </button>
            </div>
          )}
        </div>
      )}

      {/* Stage: done - success */}
      {stage === 'done' && (
        <div className="bg-white rounded-xl border border-slate-100 p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 mb-5">
            <CheckCircle2 size={32} className="text-emerald-500" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">导入完成！</h2>
          <p className="text-sm text-slate-500 mb-6">
            成功导入 <span className="font-bold text-emerald-600">{summary.newCustomers}</span> 个新客户，
            跳过 <span className="font-bold text-amber-600">{summary.duplicates}</span> 个重复项
          </p>
          <div className="inline-flex items-center gap-4 bg-emerald-50 rounded-xl px-6 py-4 mb-6">
            <div className="text-left">
              <div className="text-xs text-emerald-600 mb-0.5">客户总数已更新</div>
              <div className="text-xl font-bold text-emerald-700">
                {CUSTOMERS.length} → {CUSTOMERS.length + summary.newCustomers}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={reset}
              className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              继续导入
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors">
              查看客户列表
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
