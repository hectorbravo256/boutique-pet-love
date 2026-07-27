import LoadingState from "./LoadingState";
import EmptyState from "./EmptyState";

export default function DataTable({

    columns = [],

    data = [],

    loading = false,

    emptyMessage = "Sin información.",

    keyField = "id",

    actions

}) {

    if (loading) {

        return <LoadingState />;

    }

    if (!data.length) {

        return (

            <EmptyState

                title={emptyMessage}

            />

        );

    }

    return (

        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

            <table className="min-w-full">

                <thead className="bg-gray-50">

<tr>

    {

        columns.map(column => (

            <th

                key={column.key}

                className="px-6 py-4 text-left text-sm font-semibold text-gray-700"

            >

                {column.label}

            </th>

        ))

    }

    {

        actions && (

            <th className="px-6 py-4">

                Acciones

            </th>

        )

    }

</tr>

</thead>

<tbody>

{

data.map(row => (

<tr

    key={row[keyField]}

    className="border-t"

>

{

columns.map(column => (

<td

    key={column.key}

    className="px-6 py-4"

>

{

column.render

? column.render(row)

: row[column.key]

}

</td>

))

}

{

actions && (

<td className="px-6 py-4">

{actions(row)}

</td>

)

}

</tr>

))

}

</tbody>

            </table>

        </div>

    );

}
