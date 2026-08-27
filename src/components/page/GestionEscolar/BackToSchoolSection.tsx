"use client";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
export default function BackToSchoolSection({ className, children }: {
    href?: string;
    className?: string;
    children?: ReactNode;
}) {
    const router = useRouter();
    const goBack = () => {
        const sameSiteReferrer = document.referrer
            ? new URL(document.referrer).origin === window.location.origin
            : false;
        if (sameSiteReferrer)
            router.back();
        else
            router.push("/#gestion-escolar");
    };
    return <button type="button" onClick={goBack} className={className}>{children}</button>;
}
