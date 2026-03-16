/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, vi } from 'vitest';
import { ZodError } from 'zod';

import { UserController } from '@routes/users/user.controller.js';

describe('UserController', () => {
  it('should throw ZodError if query pagination is invalid', async () => {
    const mockUserService = { getUsers: vi.fn() } as any;
    const controller = new UserController(mockUserService);

    const req = { query: { page: 'not-a-number' } } as any;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;

    await expect(controller.getAllUsers(req, res)).rejects.toThrow(ZodError);

    expect(mockUserService.getUsers).not.toHaveBeenCalled();
  });

  it('should call service if validation passes', async () => {
    const mockUserService = { getUsers: vi.fn().mockResolvedValue({ items: [], total: 0 }) } as any;
    const controller = new UserController(mockUserService);

    const req = { query: { page: '1', limit: '10' } } as any;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;

    await controller.getAllUsers(req, res);

    expect(mockUserService.getUsers).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: 10 }),
    );
  });
});
