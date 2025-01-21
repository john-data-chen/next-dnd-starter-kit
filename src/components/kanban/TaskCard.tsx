import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Task } from '@/types/tasks';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cva } from 'class-variance-authority';
import { IconDragDrop } from '@tabler/icons-react';
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
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: task.id,
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

  return (
    <Card
      ref={setNodeRef}
      style={cardStyle}
      className={cardVariants({ dragging: dragState })}
      data-testid="task-card"
    >
      <CardHeader className="flex flex-row justify-between border-b-2 border-secondary px-3 py-3">
        <Button
          variant="ghost"
          {...attributes}
          {...listeners}
          className="-ml-2 h-auto cursor-grab p-1 text-secondary-foreground/50"
          data-testid="task-card-drag-button"
          aria-label="Move task"
        >
          <IconDragDrop />
        </Button>
        <TaskActions title={task.title} id={task.id} />
      </CardHeader>

      <CardContent className="whitespace-pre-wrap px-3 pb-6 pt-3 text-left">
        <p
          className="text-sl text-muted-foreground"
          data-testid="task-card-description"
        >
          {task.description}
        </p>
      </CardContent>
    </Card>
  );
}
