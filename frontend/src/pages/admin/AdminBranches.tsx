import React, { useState } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { useApi } from '../../hooks/useApi';
import api from '../../api/axios';
import { Loader2, Plus, Edit, Trash2, Building2 } from 'lucide-react';

export const AdminBranches: React.FC = () => {
  const { data: branches, loading, refetch } = useApi<any[]>('/branches');
  const [isAdding, setIsAdding] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName.trim()) return;
    setSubmitting(true);
    try {
      await api.post('/branches', { branch_name: newBranchName });
      setNewBranchName('');
      setIsAdding(false);
      refetch();
    } catch (err) {
      console.error(err);
      alert('Failed to add branch');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this branch?')) return;
    try {
      await api.delete(`/branches/${id}`);
      refetch();
    } catch (err) {
      console.error(err);
      alert('Failed to delete branch');
    }
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Branches Management</h1>
          <p className="text-sm text-slate-500 mt-1">Admin / Branches</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-primary hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-primary/20 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Branch
        </button>
      </div>

      {isAdding && (
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-6">
            <form onSubmit={handleAdd} className="flex items-end space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-2">Branch Name</label>
                <input
                  type="text"
                  required
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="e.g. Mechanical Engineering"
                />
              </div>
              <button 
                type="submit" 
                disabled={submitting}
                className="bg-slate-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Save Branch'}
              </button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches?.map((branch) => (
          <Card key={branch._id} className="hover:shadow-md transition-shadow group">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{branch.branch_name}</h3>
                    <p className="text-xs text-slate-500">ID: {branch._id.substring(0, 8)}</p>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                  <button className="text-slate-400 hover:text-blue-500"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(branch._id)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
