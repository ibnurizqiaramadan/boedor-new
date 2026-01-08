'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

interface AddUserDialogProps {
  onAddUser: (user: { username: string; password: string; role: 'super_admin' | 'admin' | 'driver' | 'user' }) => void;
}

export default function AddUserDialog({ onAddUser }: AddUserDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    role: 'user' as 'super_admin' | 'admin' | 'driver' | 'user'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newUser.username.trim() || !newUser.password.trim()) {
      toast.error('Username dan password wajib diisi');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddUser(newUser);
      toast.success('Pengguna berhasil ditambahkan!');
      setIsOpen(false);
      setNewUser({ username: '', password: '', role: 'user' });
    } catch (error) {
      console.error('Failed to add user:', error);
      toast.error('Gagal menambah pengguna: ' + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Pengguna
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Pengguna Baru</DialogTitle>
          <DialogDescription>Buat akun pengguna baru</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* <Input
            placeholder="Nama Pengguna"
            value={newUser.username}
            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
            disabled={isSubmitting}
          />
          <Input
            type="password"
            placeholder="Kata Sandi"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            disabled={isSubmitting}
          /> */}
          <select
            className="w-full p-2 border rounded"
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'super_admin' | 'admin' | 'driver' | 'user' })}
            disabled={isSubmitting}
          >
            <option value="user">Pengguna</option>
            <option value="driver">Pengemudi</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Menambah...' : 'Tambah Pengguna'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}