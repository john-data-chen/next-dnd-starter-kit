'use client';
import { Fragment, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTaskStore } from '@/lib/store';
import {
  Announcements,
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  Active,
  DataRef,
  Over
} from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { BoardColumn, BoardContainer } from './board-column';
import NewProjectDialog from './new-project-dialog';
import { TaskCard } from './task-card';
import { Task, Column } from '@/types/tasks';
import DraggableData from '@/types/drag&drop';
import { set } from 'react-hook-form';

export function KanbanBoard() {
  const columns = useTaskStore((state) => state.columns);
  const setColumns = useTaskStore((state) => state.setCols);
  const pickedUpTaskColumn = useRef<string | null>(null);
  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
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
    if (data?.type === 'Column' || data?.type === 'Task') {
      return true;
    }
    return false;
  }

  function getDraggingTaskData(taskId: string, columnId: string) {
    const column = columns.find((col) => col.id === columnId);
    const tasksInColumn = column!.tasks.filter(
      (task) => task.columnId === columnId
    );
    const taskPosition = tasksInColumn.findIndex((task) => task.id === taskId);
    return {
      tasksInColumn,
      taskPosition,
      column
    };
  }

  function onDragStart(event: DragStartEvent) {
    if (!hasDraggableData(event.active)) return;
    const data = event.active.data.current;
    if (data?.type === 'Column') {
      setActiveColumn(data?.column);
      return;
    }
    if (data?.type === 'Task') {
      setActiveTask(data?.task);
      return;
    }
  }

  function onDragOver(event: DragOverEvent) {
    const updatedColumns = [...columns];
    const { active, over } = event;
    // stop if no over data
    if (!over) return;
    // stop if active and over are the same
    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;
    // stop if no draggable data
    if (!hasDraggableData(active) || !hasDraggableData(over)) return;
    // stop if active is a column
    if (active.data.current!.type === 'Column') return;
    // get active task
    const activeTask = active.data.current!.task;
    const activeColumn = updatedColumns.find(
      (col) => col.id === active.data.current!.task.columnId
    );
    const activeTaskIdx = activeColumn!.tasks.findIndex(
      (task) => task.id === activeTask.id
    );
    if (over.data.current!.type === 'Column') {
      console.log('over column');
      const overColumn = updatedColumns.find(
        (col) => col.id === over.data.current!.column.id
      );
      activeTask.columnId = overColumn!.id;
      overColumn!.tasks.push(activeTask);
      activeColumn!.tasks.splice(activeTaskIdx, 1);
    }
    if (over.data.current!.type === 'Task') {
      console.log('over task');
    }
    setColumns(updatedColumns);
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (!hasDraggableData(active)) return;

    const activeData = active.data.current;

    if (activeId === overId) return;

    const isActiveAColumn = activeData?.type === 'Column';
    if (!isActiveAColumn) return;
    const activeColumnIndex = columns.findIndex((col) => col.id === activeId);

    const overColumnIndex = columns.findIndex((col) => col.id === overId);

    setColumns(arrayMove(columns, activeColumnIndex, overColumnIndex));
  }

  const announcements: Announcements = {
    onDragStart({ active }) {
      if (!hasDraggableData(active)) return;
      if (active.data.current?.type === 'Column') {
        const startColumnIdx = columnsId.findIndex((id) => id === active.id);
        const startColumn = columns[startColumnIdx];
        return `Picked up Column ${startColumn?.title} at position: ${
          startColumnIdx + 1
        } of ${columnsId.length}`;
      } else if (active.data.current?.type === 'Task') {
        pickedUpTaskColumn.current = active.data.current.task.columnId;
        const { tasksInColumn, taskPosition, column } = getDraggingTaskData(
          active.data.current.task.id,
          pickedUpTaskColumn.current
        );
        return `Picked up Task ${
          active.data.current.task.title
        } at position: ${taskPosition + 1} of ${
          tasksInColumn.length
        } in column ${column?.title}`;
      }
    },
    onDragOver({ active, over }) {
      if (!hasDraggableData(active) || !hasDraggableData(over)) return;
      if (
        active.data.current?.type === 'Column' &&
        over.data.current?.type === 'Column'
      ) {
        const overColumnIdx = columnsId.findIndex((id) => id === over.id);
        return `Column ${active.data.current.column.title} was moved over ${
          over.data.current.column.title
        } at position ${overColumnIdx + 1} of ${columnsId.length}`;
      } else if (
        active.data.current?.type === 'Task' &&
        over.data.current?.type === 'Task'
      ) {
        const { tasksInColumn, taskPosition, column } = getDraggingTaskData(
          over.data.current.task.id,
          over.data.current.task.columnId
        );
        if (over.data.current.task.columnId !== pickedUpTaskColumn.current) {
          return `Task ${
            active.data.current.task.title
          } was moved over column ${column?.title} in position ${
            taskPosition + 1
          } of ${tasksInColumn.length}`;
        }
        return `Task was moved over position ${taskPosition + 1} of ${
          tasksInColumn.length
        } in column ${column?.title}`;
      }
    },
    onDragEnd({ active, over }) {
      if (!hasDraggableData(active) || !hasDraggableData(over)) {
        pickedUpTaskColumn.current = null;
        return;
      }
      if (
        active.data.current?.type === 'Column' &&
        over.data.current?.type === 'Column'
      ) {
        const overColumnPosition = columnsId.findIndex((id) => id === over.id);

        return `Column ${
          active.data.current.column.title
        } was dropped into position ${overColumnPosition + 1} of ${
          columnsId.length
        }`;
      } else if (
        active.data.current?.type === 'Task' &&
        over.data.current?.type === 'Task'
      ) {
        const { tasksInColumn, taskPosition, column } = getDraggingTaskData(
          over.data.current.task.id,
          over.data.current.task.columnId
        );
        if (over.data.current.task.columnId !== pickedUpTaskColumn.current) {
          return `Task was dropped into column ${column?.title} in position ${
            taskPosition + 1
          } of ${tasksInColumn.length}`;
        }
        return `Task was dropped into position ${taskPosition + 1} of ${
          tasksInColumn.length
        } in column ${column?.title}`;
      }
      pickedUpTaskColumn.current = null;
    },
    onDragCancel({ active }) {
      if (!hasDraggableData(active)) return;
      return `Dragging ${active.data.current?.type} cancelled.`;
    }
  };

  return (
    <DndContext
      sensors={sensors}
      accessibility={{
        announcements
      }}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <BoardContainer>
        <SortableContext items={columnsId}>
          {columns?.map((col, index) => (
            <Fragment key={col.id}>
              <BoardColumn column={col} tasks={col.tasks} />
              {index === columns?.length - 1 && (
                <div className="w-[300px]">
                  <NewProjectDialog />
                </div>
              )}
            </Fragment>
          ))}
          {!columns.length && <NewProjectDialog />}
        </SortableContext>
      </BoardContainer>

      {'document' in window &&
        createPortal(
          <DragOverlay>
            {activeColumn && (
              <BoardColumn
                isOverlay
                column={activeColumn}
                tasks={activeColumn.tasks}
              />
            )}
            {activeTask && <TaskCard task={activeTask} isOverlay />}
          </DragOverlay>,
          document.body
        )}
    </DndContext>
  );
}
