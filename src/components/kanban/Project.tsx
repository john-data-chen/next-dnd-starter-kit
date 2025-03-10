import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Project, Task } from '@/types/dbInterface';
import { useDndContext } from '@dnd-kit/core';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cva } from 'class-variance-authority';
import { PointerIcon } from 'lucide-react';
import { useMemo } from 'react';
import NewTaskDialog from './NewTaskDialog';
import { ProjectActions } from './ProjectAction';
import { TaskCard } from './TaskCard';

export interface ProjectDragData {
  type: 'Project';
  project: Project;
}

interface BoardProjectProps {
  project: Project;
  tasks: Task[];
  isOverlay?: boolean;
}

export function BoardProject({ project, tasks, isOverlay }: BoardProjectProps) {
  // Memoize task IDs for better performance
  const tasksIds = useMemo(
    () => project.tasks.map((task) => task._id),
    [project.tasks]
  );

  // Setup drag & drop functionality
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: project._id,
    data: {
      type: 'Project',
      project
    } satisfies ProjectDragData,
    attributes: {
      roleDescription: `Project: ${project.title}`
    }
  });

  // Define drag & drop styles
  const style = {
    transition,
    transform: CSS.Translate.toString(transform)
  };

  // Define card style variants based on drag state
  const variants = cva(
    'h-[75vh] max-h-[75vh] w-[350px] max-w-full bg-secondary flex flex-col shrink-0 snap-center',
    {
      variants: {
        dragging: {
          default: 'border-2 border-transparent',
          over: 'ring-2 opacity-30',
          overlay: 'ring-2 ring-primary'
        }
      }
    }
  );

  const dragState = isOverlay ? 'overlay' : isDragging ? 'over' : undefined;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={variants({ dragging: dragState })}
      data-testid={`project-container`}
    >
      <CardHeader className="space-between flex flex-row items-center border-b-2 p-4 text-left font-semibold">
        <Button
          variant="ghost"
          {...attributes}
          {...listeners}
          className="text-primary/50 relative -ml-2 h-auto cursor-grab p-1"
        >
          <span className="sr-only">drag project: {project.title}</span>
          <PointerIcon />
        </Button>
        <ProjectActions id={project._id} title={project.title} />
      </CardHeader>

      <CardContent className="flex grow flex-col gap-4 overflow-x-hidden p-2">
        <ScrollArea className="h-full">
          <div className="mb-2">
            <Badge variant="outline" className="text-xs">
              owner: {project.owner.name}
            </Badge>
          </div>
          <NewTaskDialog projectId={project._id} />
          <SortableContext items={tasksIds}>
            {tasks.map((task) => (
              <TaskCard key={task._id} task={task} />
            ))}
          </SortableContext>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export function BoardContainer({ children }: { children: React.ReactNode }) {
  const dndContext = useDndContext();

  const variations = cva('px-2 pb-4 md:px-0 flex flex-col sm:flex-row', {
    variants: {
      dragging: {
        default: '',
        active: 'snap-none'
      }
    }
  });

  return (
    <ScrollArea className="w-full rounded-md whitespace-nowrap">
      <div
        className={variations({
          dragging: dndContext.active ? 'active' : 'default'
        })}
      >
        <div className="grid-flow-col-1 grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {children}
        </div>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
