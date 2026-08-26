"use client";
import { useDashboardData } from "@/stores/DashboardDataContext";
import OperationalManagementPageCurrent from "./OperationalManagementPageCurrent";
import OperationalManagementPageLegacy from "./OperationalManagementPageLegacy";
export default function OperationalManagementPage() {
    const { snapshotDate } = useDashboardData();
    const preserveAugust13Design = snapshotDate === "2026-08-13";
    return preserveAugust13Design ? <OperationalManagementPageLegacy /> : <OperationalManagementPageCurrent />;
}
