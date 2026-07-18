export default function Breadcrumb({
  items = [],
}) {
  return (
    <div className="mb-6 text-sm text-slate-500">

      {items.map((item, index) => (

        <span key={index}>

          {item}

          {index < items.length - 1 && (
            <span className="mx-2 text-slate-300">
              /
            </span>
          )}

        </span>

      ))}

    </div>
  );
}
