'use client';

import demoTasks from '@/constants/demoTasks';
import { useTaskStore } from '@/lib/store';
import DraggableData from '@/types/drag&drop';
import { Project, Task } from '@/types/tasks';
import {
  Active,
  Announcements,
  DataRef,
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  MouseSensor,
  Over,
  TouchSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';
import { Fragment, useMemo, useRef, useState } from 'react';
import NewProjectDialog from './NewProjectDialog';
import { BoardContainer, BoardProject } from './Project';
import { TaskCard } from './TaskCard';

export function KanbanBoard() {
  const projects = useTaskStore((state) => state.projects);
  const setProjects = useTaskStore((state) => state.setProjects);
  const pickedUpTaskProject = useRef<string | null>(null);
  const projectsId = useMemo(
    () => projects.map((project: Project) => project.id),
    [projects]
  );

  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  function hasDraggableData<T extends Active | Over>(
    entry: T | null | undefined
  ): entry is T & {
    data: DataRef<DraggableData>;
  } {
    if (!entry) {
      return false;
    }
    const data = entry.data.current;
    if (data?.type === 'Project' || data?.type === 'Task') {
      return true;
    }
    return false;
  }

  function getDraggingTaskData(taskId: string, projectId: string) {
    const project = projects.find(
      (project: Project) => project.id === projectId
    );
    const tasksInProject = project!.tasks.filter(
      (task: { projectId: string }) => task.projectId === projectId
    );
    const taskPosition = tasksInProject.findIndex(
      (task: { id: string }) => task.id === taskId
    );
    return {
      tasksInProject,
      taskPosition,
      project
    };
  }

  function onDragStart(event: DragStartEvent) {
    if (!hasDraggableData(event.active)) return;
    const data = event.active.data.current;
    if (data?.type === 'Project') {
      setActiveProject(data?.project);
      return;
    }
    if (data?.type === 'Task') {
      setActiveTask(data?.task);
      return;
    }
  }

  function onDragOver(event: DragOverEvent) {
    const updatedProjects = [...projects];
    const { active, over } = event;
    // stop if no over data
    if (!over) return;
    // stop if active and over are the same
    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;
    // stop if no draggable data
    if (!hasDraggableData(active) || !hasDraggableData(over)) return;
    // stop if active is a project
    if (active.data.current!.type === 'Project') return;
    // get active task
    const activeTask = active.data.current!.task;
    const activeProject = updatedProjects.find(
      (project: Project) => project.id === active.data.current!.task.projectId
    );
    const activeTaskIdx = activeProject!.tasks.findIndex(
      (task: Task) => task.id === activeTask.id
    );
    // drag a task over a project
    if (over.data.current!.type === 'Project') {
      const overProject = updatedProjects.find(
        (project: Project) => project.id === over.data.current!.project.id
      );
      activeTask.projectId = overProject!.id;
      overProject!.tasks.push(activeTask);
      activeProject!.tasks.splice(activeTaskIdx, 1);
    }
    // drag a task over a task
    if (over.data.current!.type === 'Task') {
      const overTask = over.data.current!.task;
      const overProject = updatedProjects.find(
        (project: Project) => project.id === overTask.projectId
      );
      const overTaskIdx = overProject!.tasks.findIndex(
        (task: Task) => task.id === overTask.id
      );
      // move task to a different project
      if (overTask.projectId !== activeTask.projectId) {
        activeTask.projectId = overTask.projectId;
        overProject!.tasks.splice(overTaskIdx, 0, activeTask);
        activeProject!.tasks.splice(activeTaskIdx, 1);
      }
      // move task to the same project
      else {
        const tempTask = activeTask;
        activeProject!.tasks.splice(activeTaskIdx, 1);
        overProject!.tasks.splice(overTaskIdx, 0, tempTask);
      }
    }
    setProjects(updatedProjects);
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveProject(null);
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (!hasDraggableData(active)) return;

    const activeData = active.data.current;

    if (activeId === overId) return;

    const isActiveAProject = activeData?.type === 'Project';
    if (!isActiveAProject) return;
    const activeProjectIndex = projects.findIndex(
      (project: Project) => project.id === activeId
    );

    const overProjectIndex = projects.findIndex(
      (project: Project) => project.id === overId
    );

    setProjects(arrayMove(projects, activeProjectIndex, overProjectIndex));
  }

  const announcements: Announcements = {
    onDragStart({ active }) {
      if (!hasDraggableData(active)) return;
      if (active.data.current?.type === 'Project') {
        const startProjectIdx = projectsId.findIndex(
          (id: string) => id === active.id
        );
        const startProject = projects[startProjectIdx];
        return `Picked up Project ${startProject?.title} at position: ${
          startProjectIdx + 1
        } of ${projectsId.length}`;
      } else if (active.data.current?.type === 'Task') {
        pickedUpTaskProject.current = active.data.current.task.projectId;
        const { tasksInProject, taskPosition, project } = getDraggingTaskData(
          active.data.current.task.id,
          active.data.current.task.projectId
        );
        return `Picked up Task ${
          active.data.current.task.title
        } at position: ${taskPosition + 1} of ${
          tasksInProject.length
        } in project ${project?.title}`;
      }
    },
    onDragOver({ active, over }) {
      if (!hasDraggableData(active) || !hasDraggableData(over)) return;
      if (
        active.data.current?.type === 'Project' &&
        over.data.current?.type === 'Project'
      ) {
        const overProjectIdx = projectsId.findIndex(
          (id: string) => id === over.id
        );
        return `Project ${active.data.current.project.title} was moved over ${
          over.data.current.project.title
        } at position ${overProjectIdx + 1} of ${projectsId.length}`;
      } else if (
        active.data.current?.type === 'Task' &&
        over.data.current?.type === 'Task'
      ) {
        const { tasksInProject, taskPosition, project } = getDraggingTaskData(
          over.data.current.task.id,
          over.data.current.task.projectId
        );
        if (over.data.current.task.projectId !== pickedUpTaskProject.current) {
          return `Task ${
            active.data.current.task.title
          } was moved over project ${project?.title} in position ${
            taskPosition + 1
          } of ${tasksInProject.length}`;
        }
        return `Task was moved over position ${taskPosition + 1} of ${
          tasksInProject.length
        } in project ${project?.title}`;
      }
    },
    onDragEnd({ active, over }) {
      if (!hasDraggableData(active) || !hasDraggableData(over)) {
        pickedUpTaskProject.current = null;
        return;
      }
      if (
        active.data.current?.type === 'Project' &&
        over.data.current?.type === 'Project'
      ) {
        const overProjectPosition = projectsId.findIndex(
          (id: string) => id === over.id
        );

        return `Project ${
          active.data.current.project.title
        } was dropped into position ${overProjectPosition + 1} of ${
          projectsId.length
        }`;
      } else if (
        active.data.current?.type === 'Task' &&
        over.data.current?.type === 'Task'
      ) {
        const { tasksInProject, taskPosition, project } = getDraggingTaskData(
          over.data.current.task.id,
          over.data.current.task.projectId
        );
        if (over.data.current.task.projectId !== pickedUpTaskProject.current) {
          return `Task was dropped into project ${project?.title} in position ${
            taskPosition + 1
          } of ${tasksInProject.length}`;
        }
        return `Task was dropped into position ${taskPosition + 1} of ${
          tasksInProject.length
        } in project ${project?.title}`;
      }
      pickedUpTaskProject.current = null;
    },
    onDragCancel({ active }) {
      if (!hasDraggableData(active)) return;
      return `Dragging ${active.data.current?.type} cancelled.`;
    }
  };

  if (typeof window !== 'undefined') {
    // Client-side code
    if (localStorage.getItem('tasks-store') === null) {
      useTaskStore.setState({
        projects: demoTasks.map((project) => ({
          ...project
        }))
      });
    }
  }

  return (
    <div data-testid="kanban-board">
      <DndContext
        id="dnd-context"
        sensors={sensors}
        accessibility={{
          announcements
        }}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="w-[200px] p-4">
          <NewProjectDialog />
        </div>
        <BoardContainer>
          <SortableContext items={projectsId}>
            {projects?.map((project: Project, index: number) => (
              <Fragment key={project.id}>
                <BoardProject project={project} tasks={project.tasks} />
                {index === projects?.length - 1}
              </Fragment>
            ))}
          </SortableContext>
        </BoardContainer>
        <DragOverlay>
          {activeProject && (
            <BoardProject
              isOverlay
              project={activeProject}
              tasks={activeProject.tasks}
            />
          )}
          {activeTask && <TaskCard task={activeTask} isOverlay />}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
