"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api/client";
import { useApiAction } from "@/lib/api/useApiAction";

interface InlineToggleFieldProps {
    campaignId?: number;
    apiPath?: string;
    field: string;
    initialValue: boolean;
    label: string;
    labelClassName?: string;
    inputClassName?: string;
    errorClassName?: string;
}

export default function InlineToggleField({
    campaignId,
    apiPath,
    field,
    initialValue,
    label,
    labelClassName,
    inputClassName,
    errorClassName,
}: InlineToggleFieldProps) {
    const router = useRouter();
    const [optimistic, setOptimistic] = useState(initialValue);

    const endpoint = apiPath ?? `/api/campaign/${campaignId}`;

    const save = useApiAction(
        async (value: boolean) =>
            apiFetch(endpoint, {
                method: "PATCH",
                body: { [field]: value },
            }),
        {
            onSuccess: () => router.refresh(),
            onError: () => setOptimistic((v) => !v),
        },
    );

    async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        const next = event.target.checked;
        setOptimistic(next);
        await save.run(next);
    }

    return (
        <label className={labelClassName}>
            <input
                type="checkbox"
                className={inputClassName}
                checked={optimistic}
                onChange={handleChange}
                disabled={save.isLoading}
            />
            {label}
            {save.error ? (
                <small className={errorClassName}>{save.error}</small>
            ) : null}
        </label>
    );
}
