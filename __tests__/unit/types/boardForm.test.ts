import { boardSchema } from '@/types/boardForm';
import { describe, expect, it } from 'vitest';

describe('boardSchema', () => {
  it('should validate a valid board object', () => {
    const validBoard = {
      title: 'Project Board',
      description: 'This is a project board'
    };

    expect(() => boardSchema.parse(validBoard)).not.toThrow();
  });

  it('should throw an error if title is missing', () => {
    const invalidBoard = {
      description: 'This is a project board'
    };

    expect(() => boardSchema.parse(invalidBoard)).toThrowError(/Required/);
  });

  it('should allow an optional description', () => {
    const validBoardWithoutDescription = {
      title: 'Project Board'
    };

    expect(() => boardSchema.parse(validBoardWithoutDescription)).not.toThrow();
  });

  it('should throw an error if title is an empty string', () => {
    const invalidBoard = {
      title: '',
      description: 'This is a project board'
    };

    expect(() => boardSchema.parse(invalidBoard)).toThrow('Title is required');
  });
});
