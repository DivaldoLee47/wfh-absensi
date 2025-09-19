'use client';

import { UserManagementTable } from '@/components/UserManagementTable';

export default function ManageUsersPage() {
    return (
      <div className="space-y-8 h-full flex flex-col">
        <header className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Manage Users</h1>
        </header>
  
        <div className="flex-1">
          <UserManagementTable />
        </div>
      </div>
    );
  }