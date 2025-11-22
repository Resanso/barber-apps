'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useAction } from 'next-safe-action/hooks';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { T } from '@/components/ui/Typography';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { insertPrivateItemAction } from '@/data/user/privateItems';
import { Shield } from 'lucide-react';

const formSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  service_time: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const formVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export const CreatePrivateItemForm: React.FC = () => {
  const router = useRouter();
  const toastRef = useRef<string | number | undefined>(undefined);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      full_name: '',
      service_time: '',
    },
  });

  const { execute, status } = useAction(insertPrivateItemAction, {
    onExecute: () => {
      toastRef.current = toast.loading('Creating item');
    },
    onSuccess: ({ data }) => {
      toast.success('Item created', { id: toastRef.current });
      toastRef.current = undefined;
      router.refresh();
      // Do not navigate to a separate private-item page; keep user on the
      // current dashboard and refresh the list. The item details are shown
      // via the inline modal when the user clicks View.
    },
    onError: ({ error }) => {
      const errorMessage = error.serverError ?? 'Failed to create item';
      toast.error(errorMessage, { id: toastRef.current });
      toastRef.current = undefined;
    },
  });

  const onSubmit = (data: FormData) => {
    execute(data);
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={formVariants}
      className="container max-w-2xl mx-auto py-6"
    >
      <Card className="shadow-lg border-t-4 border-t-primary">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>
              <T.H2>Create Private Item</T.H2>
            </CardTitle>
          </div>
          <CardDescription>
            This item will be private and only visible to you when logged in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="service_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                className="w-full flex items-center justify-center gap-2"
                type="submit"
                disabled={status === 'executing' || !form.formState.isValid}
              >
                {status === 'executing' ? (
                  <>
                    <Spinner className="h-4 w-4" />
                    <span>Creating Item...</span>
                  </>
                ) : (
                  'Create Private Item'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );
};
