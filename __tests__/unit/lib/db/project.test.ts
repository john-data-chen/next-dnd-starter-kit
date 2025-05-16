import {
  createProjectInDb,
  deleteProjectInDb,
  getProjectsFromDb,
  updateProjectInDb
} from '@/lib/db/project';
import { Project, UserInfo } from '@/types/dbInterface';
import { Types } from 'mongoose';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// --- Mocking Setup ---
const mockConnect = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const mockGetUserByEmail = vi.hoisted(() => vi.fn());
const mockGetUserById = vi.hoisted(() => vi.fn());

const mockProjectLean = vi.hoisted(() => vi.fn());
const mockProjectFind = vi.hoisted(() =>
  vi.fn(() => ({ lean: mockProjectLean }))
);
const mockProjectFindById = vi.hoisted(() => vi.fn());
const mockProjectCreate = vi.hoisted(() => vi.fn());
const mockProjectFindByIdAndUpdate = vi.hoisted(() => vi.fn());
const mockProjectFindByIdAndDelete = vi.hoisted(() => vi.fn());
const mockProjectToObject = vi.hoisted(() => vi.fn());

const mockBoardFindByIdAndUpdate = vi.hoisted(() => vi.fn());

// Mock modules
vi.mock('@/lib/db/connect', () => ({ connectToDatabase: mockConnect }));
vi.mock('@/lib/db/user', () => ({
  getUserByEmail: mockGetUserByEmail,
  getUserById: mockGetUserById
}));
vi.mock('@/models/project.model', () => ({
  ProjectModel: {
    find: mockProjectFind,
    findById: mockProjectFindById,
    create: mockProjectCreate,
    findByIdAndUpdate: mockProjectFindByIdAndUpdate,
    findByIdAndDelete: mockProjectFindByIdAndDelete
  }
}));
vi.mock('@/models/board.model', () => ({
  BoardModel: {
    findByIdAndUpdate: mockBoardFindByIdAndUpdate
  }
}));

describe('Database Project Functions', () => {
  // --- Mock Data ---
  const mockUserId = new Types.ObjectId().toString();
  const mockUserEmail = 'test@example.com';
  const mockUserName = 'Test User';
  const mockUserInfo: UserInfo = { id: mockUserId, name: mockUserName };

  const mockBoardId = new Types.ObjectId().toString();
  const mockProjectId = new Types.ObjectId().toString();

  const mockProject = {
    _id: new Types.ObjectId(mockProjectId),
    title: 'Test Project',
    description: 'Test Description',
    owner: mockUserId,
    members: [mockUserId],
    board: mockBoardId,
    createdAt: new Date(),
    updatedAt: new Date(),
    toObject: mockProjectToObject
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockConnect.mockResolvedValue(undefined);
    mockGetUserByEmail.mockResolvedValue(mockUserInfo);
    mockGetUserById.mockResolvedValue(mockUserInfo);

    mockProjectToObject.mockImplementation(function (this: any) {
      const plainObject: any = {};
      for (const key in this) {
        if (
          Object.prototype.hasOwnProperty.call(this, key) &&
          key !== 'toObject'
        ) {
          const value = this[key];
          if (value instanceof Types.ObjectId) {
            plainObject[key] = value.toString();
          } else {
            plainObject[key] = value;
          }
        }
      }
      return plainObject;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getProjectsFromDb', () => {
    it('should fetch and convert projects for a board', async () => {
      const projects = [mockProject];
      mockProjectLean.mockReturnValue(projects);
      mockProjectFind.mockReturnValue({ lean: mockProjectLean });

      const result = await getProjectsFromDb(mockBoardId);

      expect(mockConnect).toHaveBeenCalledTimes(1);
      expect(mockProjectFind).toHaveBeenCalledWith({
        board: expect.any(Types.ObjectId)
      });
      expect(result).toHaveLength(1);
      expect(result![0]._id).toBe(mockProjectId);
    });

    it('should return empty array when no projects found', async () => {
      mockProjectLean.mockReturnValue([]);
      mockProjectFind.mockReturnValue({ lean: mockProjectLean });

      const result = await getProjectsFromDb(mockBoardId);

      expect(result).toEqual([]);
    });

    it('should return null when error occurs', async () => {
      mockProjectFind.mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const result = await getProjectsFromDb(mockBoardId);

      expect(result).toBeNull();
    });
  });

  describe('createProjectInDb', () => {
    const createData = {
      title: 'New Project',
      description: 'New Description',
      board: mockBoardId,
      userEmail: mockUserEmail
    };

    it('should create a project successfully', async () => {
      const createdProject = {
        ...mockProject,
        title: createData.title,
        description: createData.description,
        toObject: mockProjectToObject
      };
      mockProjectCreate.mockResolvedValueOnce(createdProject);
      mockBoardFindByIdAndUpdate.mockResolvedValueOnce({ _id: mockBoardId });

      const result = await createProjectInDb(createData);

      expect(mockConnect).toHaveBeenCalledTimes(1);
      expect(mockGetUserByEmail).toHaveBeenCalledWith(mockUserEmail);
      expect(mockProjectCreate).toHaveBeenCalledWith({
        ...createData,
        owner: mockUserId,
        members: [mockUserId],
        board: expect.any(Types.ObjectId)
      });
      expect(mockBoardFindByIdAndUpdate).toHaveBeenCalled();
      expect(result).not.toBeNull();
      expect(result!._id.toString()).toBe(mockProjectId);
    });

    it('should return null when user not found', async () => {
      mockGetUserByEmail.mockResolvedValueOnce(null);

      const result = await createProjectInDb(createData);

      expect(result).toBeNull();
      expect(mockProjectCreate).not.toHaveBeenCalled();
    });

    it('should return null when board update fails', async () => {
      mockBoardFindByIdAndUpdate.mockResolvedValueOnce(null);

      const result = await createProjectInDb(createData);

      expect(result).toBeNull();
    });
  });

  describe('updateProjectInDb', () => {
    const updateData = {
      projectId: mockProjectId,
      userEmail: mockUserEmail,
      newTitle: 'Updated Title',
      newDescription: 'Updated Description'
    };

    it('should update project successfully', async () => {
      mockProjectFindById.mockResolvedValueOnce(mockProject);
      mockProjectFindByIdAndUpdate.mockResolvedValueOnce({
        ...mockProject,
        title: updateData.newTitle,
        description: updateData.newDescription,
        toObject: mockProjectToObject
      });

      const result = await updateProjectInDb(updateData);

      expect(mockConnect).toHaveBeenCalledTimes(1);
      expect(mockGetUserByEmail).toHaveBeenCalledWith(mockUserEmail);
      expect(mockProjectFindByIdAndUpdate.mock.calls[0][0]).toBe(
        mockProject._id
      );
      expect(result).not.toBeNull();
      expect(result!.title).toBe(updateData.newTitle);
    });

    it('should return null when project not found', async () => {
      mockProjectFindById.mockResolvedValueOnce(null);

      const result = await updateProjectInDb(updateData);

      expect(result).toBeNull();
    });

    it('should return null when user is not owner', async () => {
      mockProjectFindById.mockResolvedValueOnce({
        ...mockProject,
        owner: new Types.ObjectId().toString()
      });

      const result = await updateProjectInDb(updateData);

      expect(result).toBeNull();
    });
  });
});
