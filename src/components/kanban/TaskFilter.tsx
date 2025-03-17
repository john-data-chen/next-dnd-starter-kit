'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useTaskStore } from '@/lib/store';
import React from 'react';

export function TaskFilter() {
  const { filter, setFilter, projects } = useTaskStore();

  const statusCounts = React.useMemo(() => {
    const counts = {
      TODO: 0,
      IN_PROGRESS: 0,
      DONE: 0
    };

    projects.forEach((project) => {
      project.tasks.forEach((task) => {
        if (task.status && counts.hasOwnProperty(task.status)) {
          counts[task.status as keyof typeof counts]++;
        }
      });
    });

    return counts;
  }, [projects]);

  const handleFilterChange = React.useCallback(
    (value: string) => {
      setFilter({ status: value === 'ALL' ? null : value });
    },
    [setFilter]
  );

  return (
    <div className="flex items-center space-x-2 mb-4">
      <Select value={filter.status || 'ALL'} onValueChange={handleFilterChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Tasks</SelectItem>
          <SelectItem value="TODO">
            To Do{' '}
            <Badge variant="outline" className="ml-2">
              {statusCounts.TODO}
            </Badge>
          </SelectItem>
          <SelectItem value="IN_PROGRESS">
            In Progress
            <Badge variant="outline" className="ml-2">
              {statusCounts.IN_PROGRESS}
            </Badge>
          </SelectItem>
          <SelectItem value="DONE">
            Done
            <Badge variant="outline" className="ml-2">
              {statusCounts.DONE}
            </Badge>
          </SelectItem>
        </SelectContent>
      </Select>

      {filter.status && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFilterChange('ALL')}
        >
          Clear Filter
        </Button>
      )}
    </div>
  );
}
