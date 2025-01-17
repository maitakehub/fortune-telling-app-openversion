import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, Edit, Trash2, ArrowLeft, Shield, UserCheck, UserX } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { User, UserRole } from '../types/user';

export default function AdminUserManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    // TODO: 実際のAPIエンドポイントからユーザーデータを取得
    const fetchUsers = async () => {
      try {
        // const response = await fetch('/api/admin/users');
        // const data = await response.json();
        // setUsers(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('このユーザーを削除してもよろしいですか？')) {
      return;
    }

    try {
      // TODO: 実際のAPIエンドポイントでユーザー削除を実装
      // await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      setUsers(users.filter(u => u.id !== userId));
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const handleUpdateUser = async (updatedUser: User) => {
    try {
      // TODO: 実際のAPIエンドポイントでユーザー更新を実装
      // await fetch(`/api/admin/users/${updatedUser.id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(updatedUser),
      // });
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
      setShowEditModal(false);
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const handleToggleSubscription = async (userId: string, isSubscribed: boolean) => {
    try {
      // TODO: 実際のAPIエンドポイントでサブスクリプション状態の更新を実装
      // await fetch(`/api/admin/users/${userId}/subscription`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ isSubscribed }),
      // });
      setUsers(users.map(u => u.id === userId ? { ...u, isSubscribed } : u));
    } catch (error) {
      console.error('Failed to update subscription:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900">
      <div className="container mx-auto px-4 py-6 sm:py-8 lg:py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 sm:mb-8 lg:mb-12">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-800/50 text-purple-100 text-sm sm:text-base rounded-lg hover:bg-purple-800 transition-colors"
          >
            <ArrowLeft size={16} className="sm:w-5 sm:h-5" />
            ダッシュボードに戻る
          </button>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-purple-200 to-amber-200">
            ユーザー管理
          </h1>
        </div>

        {loading ? (
          <div className="text-center py-6 sm:py-8">
            <p className="text-sm sm:text-base text-purple-200">読み込み中...</p>
          </div>
        ) : (
          <div className="bg-purple-900/30 border border-purple-700/50 rounded-xl p-4 sm:p-6">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-purple-700/50">
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm text-purple-200">ID</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm text-purple-200">メールアドレス</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm text-purple-200">ロール</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm text-purple-200">サブスクリプション</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm text-purple-200">作成日</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm text-purple-200">アクション</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b border-purple-700/30">
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-purple-200">{user.id}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-purple-200">{user.email}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs sm:text-sm ${
                          user.role === UserRole.ADMIN
                            ? 'bg-red-500/20 text-red-300'
                            : user.role === UserRole.TEST_USER
                            ? 'bg-yellow-500/20 text-yellow-300'
                            : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {user.role === UserRole.ADMIN && <Shield size={12} className="sm:w-4 sm:h-4" />}
                          {user.role === UserRole.TEST_USER && <UserIcon size={12} className="sm:w-4 sm:h-4" />}
                          {user.role === UserRole.USER && <UserCheck size={12} className="sm:w-4 sm:h-4" />}
                          {user.role}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3">
                        <button
                          onClick={() => handleToggleSubscription(user.id, !user.isSubscribed)}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs sm:text-sm ${
                            user.isSubscribed
                              ? 'bg-green-500/20 text-green-300'
                              : 'bg-gray-500/20 text-gray-300'
                          }`}
                        >
                          {user.isSubscribed ? <UserCheck size={12} className="sm:w-4 sm:h-4" /> : <UserX size={12} className="sm:w-4 sm:h-4" />}
                          {user.isSubscribed ? '有効' : '無効'}
                        </button>
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-purple-200">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-right">
                        <div className="flex items-center justify-end gap-1 sm:gap-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="p-1 text-purple-300 hover:text-purple-100 transition-colors"
                          >
                            <Edit size={16} className="sm:w-[18px] sm:h-[18px]" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-1 text-purple-300 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showEditModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-purple-900 border border-purple-700 rounded-xl p-4 sm:p-6 w-full max-w-md">
              <h2 className="text-lg sm:text-xl font-bold text-purple-100 mb-3 sm:mb-4">
                ユーザー編集
              </h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const updatedUser = {
                    ...selectedUser,
                    email: formData.get('email') as string,
                    role: formData.get('role') as UserRole,
                    isSubscribed: formData.get('isSubscribed') === 'true',
                  };
                  handleUpdateUser(updatedUser);
                }}
                className="space-y-3 sm:space-y-4"
              >
                <div>
                  <label className="block text-sm sm:text-base font-medium text-purple-200 mb-1">
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={selectedUser.email}
                    className="w-full px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-800/50 border border-purple-700 rounded-lg text-sm sm:text-base text-purple-100 placeholder-purple-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm sm:text-base font-medium text-purple-200 mb-1">
                    ロール
                  </label>
                  <select
                    name="role"
                    defaultValue={selectedUser.role}
                    className="w-full px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-800/50 border border-purple-700 rounded-lg text-sm sm:text-base text-purple-100"
                  >
                    <option value={UserRole.USER}>ユーザー</option>
                    <option value={UserRole.TEST_USER}>テストユーザー</option>
                    <option value={UserRole.ADMIN}>管理者</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm sm:text-base font-medium text-purple-200 mb-1">
                    サブスクリプション
                  </label>
                  <select
                    name="isSubscribed"
                    defaultValue={String(selectedUser.isSubscribed)}
                    className="w-full px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-800/50 border border-purple-700 rounded-lg text-sm sm:text-base text-purple-100"
                  >
                    <option value="true">有効</option>
                    <option value="false">無効</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base text-purple-200 hover:text-purple-100 transition-colors"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-600 text-sm sm:text-base text-purple-100 rounded-lg hover:bg-purple-500 transition-colors"
                  >
                    保存
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 