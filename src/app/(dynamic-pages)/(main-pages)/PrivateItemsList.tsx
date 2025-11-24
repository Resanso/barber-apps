"use client";

import { ConfirmDeleteItemDialog } from '@/app/(dynamic-pages)/(main-pages)/(logged-in-pages)/private-item/[privateItemId]/ConfirmDeleteItemDialog';
import { T } from '@/components/ui/Typography';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Table as TableType } from '@/types';
import {
  Clock,
  ExternalLink,
  Lock,
  PlusCircle,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface PrivateItemsListProps {
  privateItems: TableType<'private_items'>[];
  showActions?: boolean;
  isBarber?: boolean;
}

export const PrivateItemsList = ({
  privateItems,
  showActions = true,
  isBarber = false,
}: PrivateItemsListProps) => {
  const [selected, setSelected] = useState<TableType<'private_items'> | null>(null);

  return (
    <div className="space-y-8">
      {showActions && (
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <T.H2>Private Items</T.H2>
              <Badge variant="outline" className="h-6 flex items-center gap-1">
                <Lock className="h-3 w-3" /> Secure
              </Badge>
            </div>
            <T.Subtle>These items are only visible to logged in users</T.Subtle>
          </div>
          <Link href="/dashboard/new">
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" /> New Private Item
            </Button>
          </Link>
        </div>
      )}

      {privateItems.length ? (
        <Card className="shadow-sm border-muted/40">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Name</TableHead>
                <TableHead className="hidden md:table-cell">
                  Time
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {privateItems.map((item) => {
                const it: any = item as any;
                const displayName = it.full_name ?? item.name ?? '—';
                const createdAt = item.created_at;

                const summary = it.service_time
                  ? <span>{new Date(String(it.service_time)).toLocaleString()}</span>
                  : it.service
                    ? <span>{it.service}</span>
                    : (typeof item.description === 'string' && item.description.length > 0
                      ? (item.description.length > 100 ? `${item.description.slice(0, 100)}...` : item.description)
                      : <span className="text-muted-foreground">—</span>);

                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {displayName}
                      {createdAt && (
                        <div className="flex items-center gap-1 mt-1 text-muted-foreground text-xs">
                          <Clock className="h-3 w-3" />
                          <span>
                            {new Date(createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {summary}
                    </TableCell>
                    <TableCell className="text-right">
                      {isBarber && (
                        <Dialog onOpenChange={(open) => (open ? setSelected(item) : setSelected(null))}>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex items-center gap-1"
                            >
                              <ExternalLink className="h-3.5 w-3.5" /> View
                            </Button>
                          </DialogTrigger>

                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{displayName}</DialogTitle>
                              <DialogDescription>
                                {createdAt && (
                                  <div className="flex items-center gap-1 mt-1 text-muted-foreground text-xs">
                                    <Clock className="h-3 w-3" />
                                    <span>
                                      {new Date(createdAt).toLocaleString()}
                                    </span>
                                  </div>
                                )}
                              </DialogDescription>
                            </DialogHeader>

                            <div className="py-2 space-y-2">
                              {it.full_name && (
                                <div className="text-sm">
                                  <strong>Full name:</strong> {it.full_name}
                                </div>
                              )}
                              {it.phone && (
                                <div className="text-sm">
                                  <strong>Phone:</strong> {it.phone}
                                </div>
                              )}
                              {it.service && (
                                <div className="text-sm">
                                  <strong>Service:</strong> {it.service}
                                </div>
                              )}
                              {it.eta_start && (
                                <div className="text-sm">
                                  <strong>ETA Start:</strong>{' '}
                                  {new Date(String(it.eta_start)).toLocaleString()}
                                </div>
                              )}
                              {it.eta_end && (
                                <div className="text-sm">
                                  <strong>ETA End:</strong>{' '}
                                  {new Date(String(it.eta_end)).toLocaleString()}
                                </div>
                              )}
                              {it.status && (
                                <div className="text-sm">
                                  <strong>Status:</strong> {it.status}
                                </div>
                              )}
                              {it.barber && (
                                <div className="text-sm">
                                  <strong>Barber:</strong> {it.barber}
                                </div>
                              )}
                              {it.service_time && (
                                <div className="text-sm">
                                  <strong>Service time:</strong>{' '}
                                  {new Date(String(it.service_time)).toLocaleString()}
                                </div>
                              )}
                              {typeof item.description === 'string' && item.description && (
                                <p className="text-sm text-muted-foreground">
                                  {item.description}
                                </p>
                              )}
                            </div>

                            <DialogFooter className="flex flex-col gap-2">
                              {isBarber && (
                                <div className="flex items-center gap-2 w-full">
                                  <select
                                    className="border rounded px-2 py-1 text-sm flex-1"
                                    defaultValue={it.status ?? 'at queue'}
                                    onChange={async (e) => {
                                      const newStatus = e.target.value;
                                      try {
                                        const res = await fetch(`/api/private-items/update/${item.id}`, {
                                          method: 'PATCH',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ status: newStatus }),
                                        });
                                        if (!res.ok) throw new Error('Failed to update');
                                      } catch (err) {
                                        console.error('Failed to update status', err);
                                        alert('Failed to update status');
                                      }
                                    }}
                                  >
                                    <option value="at queue">At Queue</option>
                                    <option value="at served">At Served</option>
                                  </select>
                                  <ConfirmDeleteItemDialog itemId={String(item.id)} />
                                </div>
                              )}
                              {!isBarber && (
                                <ConfirmDeleteItemDialog itemId={String(item.id)} />
                              )}
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ShieldCheck />
            </EmptyMedia>
            <EmptyTitle>No Private Items Available</EmptyTitle>
            <EmptyDescription>
              You haven't created any private items yet. Create your first one
              to get started!
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Link href="/dashboard/new">
              <Button className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" /> Create Your First Private
                Item
              </Button>
            </Link>
          </EmptyContent>
        </Empty>
      )}
    </div>
  );
};
