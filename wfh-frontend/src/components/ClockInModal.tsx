'use client';

import { useState } from 'react';
import { attendanceService } from '@/services';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Camera, AlertCircle } from 'lucide-react';

interface ClockInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
}

export function ClockInModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  title = "Clock In Required",
  description = "Please clock in with a photo proof before accessing the dashboard."
}: ClockInModalProps) {
  const [photo, setPhoto] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setPhoto(selectedFile);
    }
  };

  const handleClockIn = async () => {
    if (!photo) {
      toast.error("Please select a photo as proof.");
      return;
    }

    setIsLoading(true);
    const loadingToastId = toast.loading('Submitting attendance...');

    try {
      await attendanceService.clockIn(photo);
      
      toast.success("Successfully clocked in!", { id: loadingToastId });
      setPhoto(null);
      onSuccess();
      onClose();
    } catch (error) {
      let errorMessage = "Clock-in failed. Please try again.";
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        errorMessage = axiosError.response?.data?.message || errorMessage;
      }
      
      toast.error(errorMessage, { id: loadingToastId });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setPhoto(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="sm:max-w-[425px]" 
        style={{ zIndex: 9999 }}
        onOpenAutoFocus={(e) => e.preventDefault()}
        data-testid="clock-in-modal"
      >
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="admin-picture" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Photo Proof <span className="text-red-500">*</span>
            </Label>
            <Input 
              id="admin-picture" 
              type="file" 
              accept="image/*"
              onChange={handleFileChange}
              disabled={isLoading}
              className="cursor-pointer"
            />
            {photo ? (
              <p className="text-sm text-green-600 dark:text-green-400">
                ✅ Selected: {photo.name}
              </p>
            ) : (
              <p className="text-sm text-amber-600 dark:text-amber-400">
                ⚠️ Please select a photo to continue
              </p>
            )}
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (!photo) {
                  toast.error("Please select a photo first!");
                  return;
                }
                handleClockIn();
              }} 
              disabled={isLoading}
              className={`min-w-[100px] ${!photo ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Submitting...
                </>
              ) : !photo ? (
                'Select Photo First'
              ) : (
                'Clock In'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
