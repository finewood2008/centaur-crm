import { Card, Badge } from '../components/ui';
import { CheckCircle2, XCircle } from 'lucide-react';

interface Props {
  success: boolean;
  message: string;
  actionType?: string;
}

const ACTION_LABELS: Record<string, string> = {
  CREATE_TASK: '创建任务',
  UPDATE_STATUS: '更新状态',
  ADVANCE_OPPORTUNITY: '推进商机',
  ADD_EVENT: '记录事件',
  MARK_ALERT: '处理预警',
};

export default function ActionResultCard({ success, message, actionType }: Props) {
  const actionLabel = actionType ? ACTION_LABELS[actionType] || actionType : '';

  return (
    <Card padding="md" hover={false} className="my-2"
      style={{
        background: success ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
        border: `1px solid ${success ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
      }}
    >
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${success ? 'bg-green-500/15' : 'bg-red-500/15'}`}>
          {success
            ? <CheckCircle2 size={16} className="text-green-400" />
            : <XCircle size={16} className="text-red-400" />
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-[var(--color-t1)]">
              {success ? '操作成功' : '操作失败'}
            </span>
            {actionLabel && <Badge variant={success ? 'ok' : 'bad'}>{actionLabel}</Badge>}
          </div>
          <p className="text-[12px] mt-1 text-[var(--color-t2)]">{message}</p>
        </div>
      </div>
    </Card>
  );
}
