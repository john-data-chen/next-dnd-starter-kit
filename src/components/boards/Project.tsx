import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useTaskStore } from '@/lib/store';
import { Project, Task } from '@/types/dbInterface';
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
  const { filter } = useTaskStore();

  const filteredTasks = useMemo(() => {
    if (!filter.status || !tasks.length) return tasks;
    return tasks.filter((task) => task.status === filter.status);
  }, [tasks, filter.status]);

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
      <CardHeader className="space-between flex flex-row items-center justify-between border-b-2 p-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            {...attributes}
            {...listeners}
            className="text-primary/50 h-8 w-16 cursor-grab p-0"
          >
            <span className="sr-only">drag project: {project.title}</span>
            <PointerIcon className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold">{project.title}</h3>
        </div>
        <ProjectActions
          id={project._id}
          title={project.title}
          description={project.description}
        />
      </CardHeader>

      <CardContent className="flex grow flex-col gap-4 overflow-x-hidden p-2">
        <ScrollArea className="h-full">
          <div className="mb-2 flex flex-col gap-1">
            <Badge variant="outline" className="text-xs">
              Description: {project.description || 'No description'}
            </Badge>
            <Badge variant="outline" className="text-xs truncate">
              Owner: {project.owner.name}
            </Badge>
            <Badge variant="outline" className="text-xs truncate">
              Members: {project.members.map((member) => member.name).join(', ')}
            </Badge>
          </div>
          <NewTaskDialog projectId={project._id} />
          <SortableContext items={tasksIds}>
            {filteredTasks.map((task) => (
              <TaskCard key={task._id} task={task} />
            ))}
          </SortableContext>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export function BoardContainer({ children }: { children: React.ReactNode }) {
  return (
    <ScrollArea className="w-full">
      <div className="flex flex-col md:flex-row gap-4 px-6 pb-4">
        {children}
      </div>
      <ScrollBar orientation="horizontal" className="hidden md:flex" />
    </ScrollArea>
  );
}
