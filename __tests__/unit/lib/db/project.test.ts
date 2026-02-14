import { Types } from "mongoose"
import { type Mock } from "vitest"

import { connectToDatabase } from "@/lib/db/connect"
import {
  createProjectInDb,
  deleteProjectInDb,
  getProjectsFromDb,
  updateProjectInDb,
  updateProjectOrderInDb
} from "@/lib/db/project"
import { getUserByEmail, getUserById } from "@/lib/db/user"
import { BoardModel } from "@/models/board.model"
import { ProjectModel } from "@/models/project.model"
import { TaskModel } from "@/models/task.model"

vi.mock("@/lib/db/connect")
vi.mock("@/lib/db/user")
vi.mock("@/models/board.model")
vi.mock("@/models/project.model")
vi.mock("@/models/task.model")

describe("Project DB functions", () => {
  const mockUser = {
    id: new Types.ObjectId().toHexString(),
    name: "Test User",
    email: "test@example.com"
  }
  const mockBoardId = new Types.ObjectId().toHexString()
  const mockProjectId = new Types.ObjectId().toHexString()
  const mockProject = {
    _id: mockProjectId,
    title: "Test Project",
    description: "Test Description",
    owner: mockUser.id,
    members: [mockUser.id],
    board: mockBoardId,
    tasks: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(connectToDatabase as Mock).mockResolvedValue(undefined)
    ;(getUserByEmail as Mock).mockResolvedValue(mockUser)
    ;(getUserById as Mock).mockImplementation((id: string) =>
      Promise.resolve(id === mockUser.id ? mockUser : null)
    )
  })

  describe("getProjectsFromDb", () => {
    it("should fetch projects for a board", async () => {
      ;(ProjectModel.find as Mock).mockReturnValue({
        sort: vi.fn().mockReturnValue({
          lean: vi
            .fn()
            .mockResolvedValue([{ ...mockProject, owner: new Types.ObjectId(mockProject.owner) }])
        })
      })
      const projects = await getProjectsFromDb(mockBoardId)
      expect(projects).toHaveLength(1)
      expect(projects?.[0].title).toBe("Test Project")
    })

    it("should return an empty array when no projects are found", async () => {
      ;(ProjectModel.find as Mock).mockReturnValue({
        sort: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([])
        })
      })
      const projects = await getProjectsFromDb(mockBoardId)
      expect(projects).toEqual([])
    })
  })

  describe("createProjectInDb", () => {
    it("should create a new project", async () => {
      ;(ProjectModel.findOne as Mock).mockReturnValue({
        sort: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue(null)
        })
      })
      ;(ProjectModel.create as Mock).mockResolvedValue({
        ...mockProject,
        toObject: () => ({
          ...mockProject,
          owner: new Types.ObjectId(mockProject.owner)
        })
      })
      ;(BoardModel.findByIdAndUpdate as Mock).mockResolvedValue(true)

      const newProject = await createProjectInDb({
        title: "Test Project",
        description: "Test Description",
        board: mockBoardId,
        userEmail: mockUser.email
      })
      expect(newProject?.title).toBe("Test Project")
      expect(BoardModel.findByIdAndUpdate).toHaveBeenCalled()
    })

    it("should return null if user is not found", async () => {
      ;(getUserByEmail as Mock).mockResolvedValue(null)
      const newProject = await createProjectInDb({
        title: "Test Project",
        description: "Test Description",
        board: mockBoardId,
        userEmail: "test@test.com"
      })
      expect(newProject).toBeNull()
    })

    it("should return null if board update fails", async () => {
      ;(ProjectModel.findOne as Mock).mockReturnValue({
        sort: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue(null)
        })
      })
      ;(ProjectModel.create as Mock).mockResolvedValue({
        ...mockProject,
        toObject: () => ({
          ...mockProject,
          owner: new Types.ObjectId(mockProject.owner)
        })
      })
      ;(BoardModel.findByIdAndUpdate as Mock).mockResolvedValue(null)
      const newProject = await createProjectInDb({
        title: "Test Project",
        description: "Test Description",
        board: mockBoardId,
        userEmail: mockUser.email
      })
      expect(newProject).toBeNull()
    })
  })

  describe("updateProjectInDb", () => {
    it("should update a project", async () => {
      ;(ProjectModel.findById as Mock).mockResolvedValue(mockProject)
      ;(ProjectModel.findByIdAndUpdate as Mock).mockReturnValue({
        lean: vi.fn().mockResolvedValue({ ...mockProject, title: "Updated Project" }),
        toObject: () => ({
          ...mockProject,
          title: "Updated Project",
          owner: new Types.ObjectId(mockProject.owner)
        })
      })

      const updatedProject = await updateProjectInDb({
        projectId: mockProjectId,
        userEmail: mockUser.email,
        newTitle: "Updated Project"
      })
      expect(updatedProject?.title).toBe("Updated Project")
    })

    it("should return null if project is not found", async () => {
      ;(ProjectModel.findById as Mock).mockResolvedValue(null)
      const updatedProject = await updateProjectInDb({
        projectId: mockProjectId,
        userEmail: mockUser.email,
        newTitle: "Updated Project"
      })
      expect(updatedProject).toBeNull()
    })

    it("should return null if user is not found", async () => {
      ;(ProjectModel.findById as Mock).mockResolvedValue(mockProject)
      ;(getUserByEmail as Mock).mockResolvedValue(null)
      const updatedProject = await updateProjectInDb({
        projectId: mockProjectId,
        userEmail: mockUser.email,
        newTitle: "Updated Project"
      })
      expect(updatedProject).toBeNull()
    })

    it("should return null if user is not the owner", async () => {
      ;(ProjectModel.findById as Mock).mockResolvedValue({
        ...mockProject,
        owner: new Types.ObjectId()
      })
      const updatedProject = await updateProjectInDb({
        projectId: mockProjectId,
        userEmail: mockUser.email,
        newTitle: "Updated Project"
      })
      expect(updatedProject).toBeNull()
    })
  })

  describe("deleteProjectInDb", () => {
    it("should delete a project", async () => {
      ;(ProjectModel.findById as Mock).mockResolvedValue(mockProject)
      ;(BoardModel.findByIdAndUpdate as Mock).mockResolvedValue(true)
      ;(TaskModel.deleteMany as Mock).mockResolvedValue({
        acknowledged: true,
        deletedCount: 0
      })
      ;(ProjectModel.findByIdAndDelete as Mock).mockResolvedValue(mockProject)

      const result = await deleteProjectInDb(mockProjectId, mockUser.email)
      expect(result).toBe(true)
    })

    it("should return false if project is not found", async () => {
      ;(ProjectModel.findById as Mock).mockResolvedValue(null)
      const result = await deleteProjectInDb(mockProjectId, mockUser.email)
      expect(result).toBe(false)
    })

    it("should return false if user is not found", async () => {
      ;(ProjectModel.findById as Mock).mockResolvedValue(mockProject)
      ;(getUserByEmail as Mock).mockResolvedValue(null)
      const result = await deleteProjectInDb(mockProjectId, mockUser.email)
      expect(result).toBe(false)
    })

    it("should return false if user is not the owner", async () => {
      ;(ProjectModel.findById as Mock).mockResolvedValue({
        ...mockProject,
        owner: new Types.ObjectId()
      })
      const result = await deleteProjectInDb(mockProjectId, mockUser.email)
      expect(result).toBe(false)
    })
  })

  describe("updateProjectOrderInDb", () => {
    it("should update project order", async () => {
      ;(ProjectModel.bulkWrite as Mock).mockResolvedValue({ ok: 1 })
      const result = await updateProjectOrderInDb(
        [mockProjectId, new Types.ObjectId().toHexString()],
        mockUser.email
      )
      expect(result).toBe(true)
      expect(ProjectModel.bulkWrite).toHaveBeenCalled()
    })

    it("should return false if user is not found", async () => {
      ;(getUserByEmail as Mock).mockResolvedValue(null)
      const result = await updateProjectOrderInDb([mockProjectId], mockUser.email)
      expect(result).toBe(false)
    })
  })
})
