import type { EmbeddedComponent } from './EmbeddedContent';
import CustomerProfileCard from './CustomerProfileCard';
import TaskListCard from './TaskListCard';
import ActionResultCard from './ActionResultCard';

interface Props {
  component: EmbeddedComponent;
}

export default function EmbeddedRenderer({ component }: Props) {
  switch (component.type) {
    case 'customer_profile':
      return <CustomerProfileCard customer={component.customer} />;
    case 'task_list':
      return <TaskListCard tasks={component.tasks} title={component.title} />;
    case 'action_result':
      return <ActionResultCard success={component.success} message={component.message} actionType={component.actionType} />;
    case 'opportunity_card':
      return <div className="text-[12px] text-[var(--color-t2)]">商机: {component.opp.service} — ¥{component.opp.estimatedValue.toLocaleString()}</div>;
    default:
      return null;
  }
}
