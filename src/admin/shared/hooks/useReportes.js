import { useCallback, useEffect, useState } from "react";
import ReportesService from "../services/ReportesService";

const DEFAULT_FILTERS = {
    from: "",
    to: "",
    tipoVenta: "todos",
    medioPago: "todos"
};

export default function useReportes(initialFilters = {}) {

    const [filters, setFilters] = useState({
        ...DEFAULT_FILTERS,
        ...initialFilters
    });

    const [sales, setSales] = useState([]);
    const [summary, setSummary] = useState({
        totalSales: 0,
        totalOrders: 0,
        averageTicket: 0
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadReportes = useCallback(async (currentFilters = filters) => {

        setLoading(true);
        setError(null);

        try {

            const result = await ReportesService.getSummary(
                currentFilters
            );

            setSales(result.sales);
            setSummary({
                totalSales: result.totalSales,
                totalOrders: result.totalOrders,
                averageTicket: result.averageTicket
            });

        } catch (err) {

            console.error("useReportes.loadReportes:", err);

            setError(
                err?.message ||
                "No fue posible cargar los reportes."
            );

            setSales([]);
            setSummary({
                totalSales: 0,
                totalOrders: 0,
                averageTicket: 0
            });

        } finally {

            setLoading(false);

        }

    }, [filters]);


    const updateFilter = useCallback((name, value) => {

        setFilters((current) => ({
            ...current,
            [name]: value
        }));

    }, []);


    const resetFilters = useCallback(() => {

        setFilters({
            ...DEFAULT_FILTERS,
            ...initialFilters
        });

    }, [initialFilters]);


    useEffect(() => {

        loadReportes();

    }, [loadReportes]);


    return {
        filters,
        setFilters,
        updateFilter,
        resetFilters,

        sales,

        totalSales: summary.totalSales,
        totalOrders: summary.totalOrders,
        averageTicket: summary.averageTicket,

        summary,

        loading,
        error,

        reload: () => loadReportes()
    };
}
