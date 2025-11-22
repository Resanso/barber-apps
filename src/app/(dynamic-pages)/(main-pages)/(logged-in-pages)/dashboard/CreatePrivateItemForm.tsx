"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreatePrivateItemForm() {
    const router = useRouter();
    const [fullName, setFullName] = useState("");
    const [serviceTime, setServiceTime] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        if (!fullName.trim()) {
            setError("Full name is required");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/private-items", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: 'same-origin',
                body: JSON.stringify({ full_name: fullName.trim(), service_time: serviceTime || null }),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                setError(body?.error || `Request failed (${res.status})`);
                setLoading(false);
                return;
            }

            setFullName("");
            setServiceTime("");
            // Refresh the server-rendered data on the dashboard
            router.refresh();
        } catch (err) {
            setError(String(err));
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input
                    placeholder="Full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="md:col-span-1"
                    aria-label="Full name"
                />
                <Input
                    type="datetime-local"
                    placeholder="Service time"
                    value={serviceTime}
                    onChange={(e) => setServiceTime(e.target.value)}
                    className="md:col-span-2"
                    aria-label="Service time"
                />
            </div>

            <div className="flex items-center gap-2">
                <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Create"}
                </Button>
                {error && <div className="text-sm text-red-600">{error}</div>}
            </div>
        </form>
    );
}
