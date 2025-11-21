import { redirect } from 'next/navigation';

export default function PrivateItemPage() {
  // Direct access to the individual private-item page is disabled in favor
  // of in-place modals. Redirect users back to the Private Items list.
  redirect('/dashboard/barber');
}
