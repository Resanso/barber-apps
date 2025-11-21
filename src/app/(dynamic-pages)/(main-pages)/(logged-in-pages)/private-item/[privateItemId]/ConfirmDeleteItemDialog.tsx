'use client';

import { AlertTriangle, Trash } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { useRouter } from 'next/navigation';
import { useRef, useState, type JSX } from 'react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { deletePrivateItemAction } from '@/data/user/privateItems';

type Props = {
  itemId: string;
};

export const ConfirmDeleteItemDialog = ({ itemId }: Props): JSX.Element => {
  const [open, setOpen] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const toastRef = useRef<string | number | undefined>(undefined);
  const router = useRouter();

  const { execute, status } = useAction(deletePrivateItemAction, {
    onExecute: () => {
      toastRef.current = toast.loading('Deleting item...');
    },
    onSuccess: () => {
      toast.success('Item deleted', { id: toastRef.current });
      toastRef.current = undefined;
      router.refresh();
      router.push('/dashboard/barber');
      setOpen(false);
    },
    onError: ({ error }) => {
      // Prefer the concrete error message when available so users see why it failed
      const fallbackMessage =
        error && typeof error === 'object' && 'message' in error
          ? (error as { message?: string }).message
          : undefined;
      const errorMessage =
        error?.serverError ?? fallbackMessage ?? 'Failed to delete item';
      // Log the full error server-side for easier debugging in dev
      // eslint-disable-next-line no-console
      console.error('deletePrivateItemAction error:', error);
      toast.error(errorMessage, { id: toastRef.current });
      toastRef.current = undefined;
    },
  });

  const handleDelete = async () => {
    const res = await fetch(`/api/private-items/update/${itemId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Delete failed');
    // handle success (toast, router.push, etc.)
  }

  return (
    <>
      <Button
        size="sm"
        className="flex items-center gap-2"
        onClick={() => setShowAlert(true)}
      >
        <Trash className="h-4 w-4" /> Delete Item
      </Button>

      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              item and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={status === 'executing'}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={status === 'executing'}
            >
              {status === 'executing' ? (
                <>
                  <Spinner className="h-4 w-4" />
                  <span>Deleting...</span>
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
