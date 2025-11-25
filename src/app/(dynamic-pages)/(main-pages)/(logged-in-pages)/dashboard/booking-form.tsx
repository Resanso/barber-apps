"use client";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";

type BookingFormProps = {
    showTrigger?: boolean;
};

export default function BookingForm({ showTrigger = true }: BookingFormProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(0); // 0: info, 1: services, 2: time

    // form state
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState<string | null>(null);
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [serviceTime, setServiceTime] = useState<string | null>(null);
    const [selectedBarber, setSelectedBarber] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const services = (require('@/data/services.json') as Array<{
        name: string;
        price: string;
        duration_minutes: number;
        notes?: string;
    }>);

    // sample barbers list (replace or load dynamically as needed)
    const barbers: Array<{ id: string; name: string }> = [
        { id: 'asep', name: 'Asep' },
        { id: 'agus', name: 'Agus' },
        { id: 'tba', name: 'TBA' },
    ];

    // Services that are mutually exclusive with "The Trich Experience"
    const incompatibleWithTrich = new Set([
        'The Cutting Edge',
        'Trim & Treat',
        'Creambath',
        'Mask Off',
    ]);

    function nextStep() {
        setError(null);
        if (step === 0) {
            if (!fullName.trim()) {
                setError('Full name is required');
                return;
            }
        }
        setStep((s) => Math.min(3, s + 1));
    }

    function prevStep() {
        setError(null);
        setStep((s) => Math.max(0, s - 1));
    }

    function resetForm() {
        setFullName('');
        setPhone(null);
        setSelectedServices([]);
        setServiceTime(null);
        setSelectedBarber(null);
        setStep(0);
        setError(null);
    }

    async function handleSubmit(e?: React.FormEvent) {
        if (e) e.preventDefault();
        setError(null);

        // final validation
        if (!fullName.trim()) {
            setError('Full name is required');
            setStep(0);
            return;
        }

        setLoading(true);
        try {
            let service_time_payload: string | null | undefined = null;
            if (serviceTime) {
                const parsed = new Date(serviceTime);
                if (isNaN(parsed.getTime())) {
                    setError('Invalid service time');
                    setLoading(false);
                    return;
                }
                // Send wall-clock local datetime without timezone information
                const pad = (n: number) => String(n).padStart(2, '0');
                const localStr = `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}T${pad(parsed.getHours())}:${pad(parsed.getMinutes())}:00`;
                service_time_payload = localStr;
            }

            const payload: any = {};
            if (phone !== null) payload.phone = phone;
            if (fullName) payload.full_name = fullName;
            if (selectedServices.length > 0) payload.service = selectedServices.join(', ');
            if (selectedBarber) payload.barber = selectedBarber;
            if (service_time_payload !== null) payload.service_time = service_time_payload;

            const res = await fetch('/api/private-items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                setError(body?.error || `Request failed (${res.status})`);
                setLoading(false);
                return;
            }

            // success
            resetForm();
            setOpen(false);
            router.refresh();
        } catch (err) {
            setError(String(err));
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={(v) => {
            setOpen(v);
            if (!v) resetForm();
        }}>
            {showTrigger && (
                <DialogTrigger asChild>
                    <Button>Book</Button>
                </DialogTrigger>
            )}

            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="w-full text-center border-b pb-4 text-3xl">Reservation</DialogTitle>
                    <DialogDescription className="w-full flex items-center justify-center gap-4 border-b pb-4 pt-4">
                        <div className={"px-4 py-2 rounded-full " + (step === 0 ? 'bg-emerald-800 text-white' : 'bg-transparent text-muted-foreground')}>Info</div>
                        <div className="text-xl text-muted-foreground">&gt;</div>
                        <div className={"px-4 py-2 rounded-full " + (step === 1 ? 'bg-emerald-800 text-white' : 'bg-transparent text-muted-foreground')}>Service</div>
                        <div className="text-xl text-muted-foreground">&gt;</div>
                        <div className={"px-4 py-2 rounded-full " + (step === 2 ? 'bg-emerald-800 text-white' : 'bg-transparent text-muted-foreground')}>Time</div>
                        <div className="text-xl text-muted-foreground">&gt;</div>
                        <div className={"px-4 py-2 rounded-full " + (step === 3 ? 'bg-emerald-800 text-white' : 'bg-transparent text-muted-foreground')}>Barber</div>
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {step === 0 && (
                        <div className="grid grid-cols-1 gap-3">
                            <h1 className="font-bold text-4xl pt-4">Schedule your cut!</h1>
                            <h1 className="pb-2">Fill in your details</h1>
                            <Input
                                placeholder="Full name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                aria-label="full_name"
                            />
                            <Input
                                placeholder="Phone"
                                value={phone ?? ""}
                                onChange={(e) => setPhone(e.target.value || null)}
                                aria-label="phone"
                            />
                        </div>
                    )}

                    {step === 1 && (
                        <div>
                            <div className="mb-1 text-sm font-medium">Service</div>
                            <div className="grid grid-cols-1 gap-0">
                                {services.map((s) => (
                                    <div key={s.name} className="flex items-start justify-between py-4 border-t">
                                        <div className="flex-1">
                                            <div className="flex items-baseline gap-4">
                                                <div className="font-semibold text-sm">{s.name}</div>
                                                <div className="text-amber-600 font-semibold text-sm">{s.price}</div>
                                            </div>
                                            <div className="text-sm text-muted-foreground">duration: {s.duration_minutes} minutes</div>
                                            {s.notes && (
                                                <div className="text-sm text-muted-foreground">{s.notes}</div>
                                            )}
                                        </div>

                                        <div className="ml-4">
                                            <input
                                                type="checkbox"
                                                className="checkbox"
                                                checked={selectedServices.includes(s.name)}
                                                disabled={
                                                    // disable incompatible services when Trich is selected
                                                    selectedServices.includes('The Trich Experience') &&
                                                    !selectedServices.includes(s.name) &&
                                                    incompatibleWithTrich.has(s.name)
                                                }
                                                onChange={(e) => {
                                                    const isTrich = s.name === 'The Trich Experience';
                                                    if (e.target.checked) {
                                                        if (isTrich) {
                                                            // If Trich is selected, replace selection with only Trich
                                                            setSelectedServices([s.name]);
                                                        } else {
                                                            // If Trich already selected, do not allow adding incompatible items
                                                            if (selectedServices.includes('The Trich Experience') && incompatibleWithTrich.has(s.name)) {
                                                                return;
                                                            }
                                                            setSelectedServices((prev) => {
                                                                // avoid duplicates
                                                                if (prev.includes(s.name)) return prev;
                                                                return [...prev, s.name];
                                                            });
                                                        }
                                                    } else {
                                                        // unchecked -> remove from selection
                                                        setSelectedServices((prev) => prev.filter((x) => x !== s.name));
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="grid grid-cols-1 gap-2">
                            <label className="text-sm text-muted-foreground">Service time</label>
                            <Input
                                type="datetime-local"
                                value={serviceTime ?? ""}
                                onChange={(e) => setServiceTime(e.target.value || null)}
                                aria-label="service_time"
                            />
                        </div>
                    )}

                    {step === 3 && (
                        <div className="grid grid-cols-1 gap-2">
                            <label className="text-sm text-muted-foreground">Choose barber</label>
                            <select
                                value={selectedBarber ?? ''}
                                onChange={(e) => setSelectedBarber(e.target.value || null)}
                                aria-label="barbers"
                                className="input"
                            >
                                <option value="">-- Select a barber --</option>
                                {barbers.map((b) => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <DialogFooter>
                        {error && <div className="text-sm text-red-600">{error}</div>}
                        <div className="flex items-center gap-2 w-full justify-between">
                            <div className="flex items-center gap-2">
                                <DialogClose asChild>
                                    <Button variant="secondary">Cancel</Button>
                                </DialogClose>
                            </div>

                            <div className="flex items-center gap-2">
                                {step > 0 && (
                                    <Button variant="outline" onClick={(e) => { e.preventDefault(); prevStep(); }} type="button">Back</Button>
                                )}

                                {step < 3 ? (
                                    <Button onClick={(e) => { e.preventDefault(); nextStep(); }} type="button">Next</Button>
                                ) : (
                                    <Button type="submit" disabled={loading}>
                                        {loading ? 'Booking...' : 'Book'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
