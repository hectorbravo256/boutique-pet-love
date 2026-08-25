export default function InventorySection({
    title,
    subtitle,
    icon,
    actions,
    children,
    className = "",
}) {
    return (
        <section
            className={`
                bg-white
                border
                border-slate-200
                rounded-2xl
                shadow-sm
                overflow-hidden
                ${className}
            `}
        >
            <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-slate-100">
                
                <div className="flex items-center gap-4 min-w-0">
                    
                    {icon && (
                        <div
                            className="
                                flex
                                h-11
                                w-11
                                shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                bg-pink-50
                                text-xl
                            "
                        >
                            {icon}
                        </div>
                    )}

                    <div className="min-w-0">
                        
                        <h2 className="text-lg font-bold text-slate-900">
                            {title}
                        </h2>

                        {subtitle && (
                            <p className="mt-1 text-sm text-slate-500">
                                {subtitle}
                            </p>
                        )}

                    </div>

                </div>

                {actions && (
                    <div className="shrink-0">
                        {actions}
                    </div>
                )}

            </div>

            <div className="p-6">
                {children}
            </div>

        </section>
    );
}
