import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Task } from '@/types/dbInterface';
import { TaskStatus } from '@/types/dbInterface';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cva } from 'class-variance-authority';
import { format } from 'date-fns';
import { PointerIcon } from 'lucide-react';
import { Calendar1Icon, FileTextIcon, UserIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { TaskActions } from './TaskAction';

interface TaskCardProps {
  task: Task;
  isOverlay?: boolean;
}

export type TaskType = 'Task';

export interface TaskDragData {
  type: TaskType;
  task: Task;
}

export function TaskCard({ task, isOverlay }: TaskCardProps) {
  const t = useTranslations('kanban.task');
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: task._id,
    data: {
      type: 'Task',
      task
    } satisfies TaskDragData,
    attributes: {
      roleDescription: 'Task'
    }
  });

  const cardStyle = {
    transition,
    transform: CSS.Translate.toString(transform)
  };

  const cardVariants = cva('', {
    variants: {
      dragging: {
        over: 'ring-2 opacity-30',
        overlay: 'ring-2 ring-primary'
      }
    }
  });

  const dragState = isOverlay ? 'overlay' : isDragging ? 'over' : undefined;

  const statusConfig: Record<
    TaskStatus,
    {
      label: string;
      className: string;
    }
  > = {
    TODO: {
      label: t('statusTodo'),
      className: 'bg-slate-500 hover:bg-slate-500'
    },
    IN_PROGRESS: {
      label: t('statusInProgress'),
      className: 'bg-blue-500 hover:bg-blue-500'
    },
    DONE: {
      label: t('statusDone'),
      className: 'bg-green-500 hover:bg-green-500'
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={cardStyle}
      className={cn('mb-3', cardVariants({ dragging: dragState }))}
      data-testid="task-card"
    >
      <CardHeader className="flex flex-row border-b-2 px-3 pb-2">
        <Button
          variant="ghost"
          {...attributes}
          {...listeners}
          className="text-secondary-foreground/50 -ml-2 h-8 w-16 cursor-grab p-1"
          data-testid="task-card-drag-button"
          aria-label={t('moveTask')}
        >
          <PointerIcon />
        </Button>
        <div className="flex flex-col gap-2 items-start flex-1 mx-2">
          {task.title && (
            <h3 className="text-lg leading-none font-medium tracking-tight">
              {task.title}
            </h3>
          )}
          <Badge
            variant="secondary"
            className={cn(
              'text-white',
              task.status && statusConfig[task.status]?.className
            )}
          >
            {task.status ? statusConfig[task.status]?.label : t('noStatus')}
          </Badge>
        </div>
        <TaskActions
          id={task._id}
          title={task.title}
          description={task.description}
          dueDate={task.dueDate}
          assignee={task.assignee?.name}
          status={task.status}
        />
      </CardHeader>
      {task.creator && (
        <CardContent className="px-3 py-2 border-b">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {task.creator.name && (
              <div className="flex items-center gap-1">
                <UserIcon className="h-4 w-4" />
                <span>{t('createdBy', { name: task.creator.name })}</span>
              </div>
            )}
          </div>
        </CardContent>
      )}
      {task.lastModifier && (
        <CardContent className="px-3 py-2 border-b">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {task.lastModifier.name && (
              <div className="flex items-center gap-1">
                <UserIcon className="h-4 w-4" />
                <span>
                  {t('lastModifiedBy', { name: task.lastModifier.name })}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      )}
      {task.assignee && (
        <CardContent className="px-3 py-2 border-b">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {task.assignee && (
              <div className="flex items-center gap-1">
                <UserIcon className="h-4 w-4" />
                <span>{t('assignee', { name: task.assignee.name })}</span>
              </div>
            )}
          </div>
        </CardContent>
      )}
      {task.dueDate && (
        <CardContent className="px-3 py-2 border-b">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {task.dueDate && (
              <div className="flex items-center gap-1">
                <Calendar1Icon className="h-4 w-4" />
                <span>
                  {t('dueDate')}: {format(new Date(task.dueDate), 'yyyy/MM/dd')}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      )}
      {task.description && (
        <CardContent className="px-3 py-2 text-left whitespace-pre-wrap">
          <div className="flex items-start gap-1">
            <FileTextIcon className="h-4 w-4 mt-1 text-muted-foreground" />
            <p
              className="text-sl text-muted-foreground"
              data-testid="task-card-description"
            >
              {task.description}
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
