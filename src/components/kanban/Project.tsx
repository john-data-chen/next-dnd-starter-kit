import { Task } from '@/types/tasks';
import { useDndContext } from '@dnd-kit/core';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cva } from 'class-variance-authority';
import { IconDragDrop } from '@tabler/icons-react';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ProjectActions } from './ProjectAction';
import { TaskCard } from './TaskCard';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import NewTaskDialog from './NewTaskDialog';
import { Project } from '@/types/tasks';

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
    () => project.tasks.map((task: { id: string }) => task.id),
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
    id: project.id,
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
    'h-[75vh] max-h-[75vh] w-[350px] max-w-full bg-secondary flex flex-col flex-shrink-0 snap-center',
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
          className="relative -ml-2 h-auto cursor-grab p-1 text-primary/50"
        >
          <span className="sr-only">drag project: {project.title}</span>
          <IconDragDrop />
        </Button>
        <ProjectActions id={project.id} title={project.title} />
      </CardHeader>

      <CardContent className="flex flex-grow flex-col gap-4 overflow-x-hidden p-2">
        <ScrollArea className="h-full">
          <NewTaskDialog projectId={project.id} />
          <SortableContext items={tasksIds}>
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </SortableContext>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export function BoardContainer({ children }: { children: React.ReactNode }) {
  const dndContext = useDndContext();

  const variations = cva('px-2  pb-4 md:px-0 flex lg:justify-start', {
    variants: {
      dragging: {
        default: '',
        active: 'snap-none'
      }
    }
  });

  return (
    <ScrollArea className="w-full whitespace-nowrap rounded-md">
      <div
        className={variations({
          dragging: dndContext.active ? 'active' : 'default'
        })}
      >
        <div className="flex flex-row items-start justify-center gap-4">
          {children}
        </div>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
