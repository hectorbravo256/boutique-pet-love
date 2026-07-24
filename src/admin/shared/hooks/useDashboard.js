import { useState, useEffect, useCallback } from "react";
import DashboardService from "../services/DashboardService";

export default function useDashboard() {

    const [summary, setSummary] = useState(null);

    const [loading, setLoading] = useState(true);

    const reload = useCallback(async () => {

        setLoading(true);

        try {

            const data = await DashboardService.getSummary();

            setSummary(data);

        } finally {

            setLoading(false);

        }

    }, []);

    useEffect(() => {

        reload();

    }, [reload]);

    return {

        summary,

        loading,

        reload

    };

}
