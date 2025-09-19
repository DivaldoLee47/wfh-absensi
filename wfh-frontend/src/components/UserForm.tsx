'use client';

import { useState, useEffect } from 'react';
import { userService, authService, User } from '@/services';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface UserFormProps {
  user: User | null; 
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; 
}

export function UserForm({ user, isOpen, onClose, onSuccess }: UserFormProps) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'employee' as 'employee' | 'admin',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name,
        email: user.email,
        password: '', 
        role: user.role,
      });
    } else {
      setFormData({ full_name: '', email: '', password: '', role: 'employee' });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: 'employee' | 'admin') => {
    setFormData((prev) => ({ ...prev, role: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (user) {
        await userService.updateUser(user.id, {
          full_name: formData.full_name,
          email: formData.email,
          role: formData.role,
        });
        toast.success('User updated successfully!');
      } else {
        await authService.register(formData);
        toast.success('User added successfully!');
      }
      onSuccess(); 
      onClose(); 
    } catch (error) {
      let errorMessage = 'An error occurred.';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        errorMessage = axiosError.response?.data?.message || errorMessage;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{user ? 'Edit User' : 'Add New User'}</DialogTitle>
            <DialogDescription>
              {user 
                ? 'Update the details for this user. Note: Role cannot be changed after creation.' 
                : 'Fill in the details to create a new user. You can choose to create either an Employee or Admin.'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="full_name" className="text-right">Full Name</Label>
              <Input id="full_name" name="full_name" value={formData.full_name} onChange={handleChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} className="col-span-3" required />
            </div>
            {!user && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">Password</Label>
                <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} className="col-span-3" required />
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">Role</Label>
              {user ? (
                // When editing, show role as read-only display
                <div className="col-span-3 flex items-center h-10 px-3 py-2 text-sm border border-input bg-muted rounded-md">
                  <span className="capitalize">{formData.role}</span>
                  <span className="ml-2 text-xs text-muted-foreground">(Cannot be changed)</span>
                </div>
              ) : (
                <Select value={formData.role} onValueChange={handleRoleChange}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading 
                ? 'Saving...' 
                : user 
                  ? 'Update User' 
                  : `Create ${formData.role === 'admin' ? 'Admin' : 'Employee'}`
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}