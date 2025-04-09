'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
      TOTAL: 0,
      TODO: 0,
      IN_PROGRESS: 0,
      DONE: 0
    };

    projects.forEach((project) => {
      project.tasks.forEach((task) => {
        counts.TOTAL++;
        if (task.status && counts.hasOwnProperty(task.status)) {
          counts[task.status as keyof typeof counts]++;
        }
      });
    });

    return counts;
  }, [projects]);

  const handleFilterChange = React.useCallback(
    (value: string) => {
      setFilter({ status: value === 'TOTAL' ? null : value });
    },
    [setFilter]
  );

  const handleSearchChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFilter({ search: event.target.value });
    },
    [setFilter]
  );

  return (
    <div className="flex items-center gap-2 mb-4">
      <Input
        type="text"
        placeholder="Search title or description..."
        value={filter.search}
        onChange={handleSearchChange}
        className="bg-background w-[60%] sm:w-[70%] rounded-md"
      />
      <Select
        value={filter.status || 'TOTAL'}
        onValueChange={handleFilterChange}
      >
        <SelectTrigger className="bg-background w-[140px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="TOTAL">
            Total
            <Badge variant="outline" className="ml-2">
              {statusCounts.TOTAL}
            </Badge>
          </SelectItem>
          <SelectItem value="TODO">
            To Do
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

      {(filter.status || filter.search) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setFilter({ status: null, search: '' });
          }}
        >
          Clear Filter
        </Button>
      )}
    </div>
  );
}
