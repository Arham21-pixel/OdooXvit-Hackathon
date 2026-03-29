"use client";

import { useState } from "react";
import Badge from "@/components/ui/Badge";
import api from "@/lib/api";

export default function UserTable({ users, onUserUpdated }) {
  const [editingId, setEditingId] = useState(null);
  const [loadingId, setLoadingId] = useState(null);

  const handleRoleChange = async (userId, newRole) => {
    setLoadingId(userId);
    try {
      await api.post(`/users/${userId}/role`, { role: newRole });
      onUserUpdated();
    } catch (err) {
      console.error("Failed to update role", err);
      // Fallback
      onUserUpdated();
    } finally {
      setLoadingId(null);
      setEditingId(null);
    }
  };

  const handleToggleApprover = async (userId, currentState) => {
    setLoadingId(userId);
    try {
      await api.post(`/users/${userId}/approver-status`, { is_manager_approver: !currentState });
      onUserUpdated();
    } catch (err) {
      console.error("Failed to update status", err);
      // Fallback
      onUserUpdated();
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-100">
        <thead className="bg-gray-50/80">
          <tr>
            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Employee</th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Auth Role</th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Direct Manager</th>
            <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Can Approve?</th>
            <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-50">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-blue-50/30 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900">{user.name}</span>
                  <span className="text-xs font-semibold text-gray-500">{user.email}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {editingId === user.id ? (
                  <select 
                    className="px-3 py-1.5 rounded-lg border border-blue-300 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    disabled={loadingId === user.id}
                  >
                    <option value="EMPLOYEE">EMPLOYEE</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                ) : (
                  <Badge status={user.role} />
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                {user.managerName || "—"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <button 
                  onClick={() => handleToggleApprover(user.id, user.is_manager_approver)}
                  disabled={loadingId === user.id}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${user.is_manager_approver ? 'bg-green-500' : 'bg-gray-200'} ${loadingId === user.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${user.is_manager_approver ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                {editingId === user.id ? (
                  <button onClick={() => setEditingId(null)} className="text-gray-500 hover:text-gray-700">Cancel</button>
                ) : (
                  <button onClick={() => setEditingId(user.id)} className="text-blue-600 hover:text-blue-800">Edit Role</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
