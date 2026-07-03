import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import AdminCard from "../components/AdminCard";

export default function PurchaseForm() {

    const [products, setProducts] = useState([]);

const [variants, setVariants] = useState([]);

const [detail, setDetail] = useState({
    product_id: "",
    variant_id: "",
    quantity: 1,
    unit_cost: 0
});

const [details, setDetails] = useState([]);

    useEffect(() => {

    cargarProductos();

}, []);

const cargarProductos = async () => {

    const { data } =
        await supabase
            .from("products")
            .select("id,name")
            .eq("active", true)
            .order("name");

    setProducts(data || []);

};

    return (

        <>

        <AdminCard>

            <div className="flex justify-between items-center mb-8">

                <div>

                    <h2 className="text-3xl font-black">

                        Registrar compra

                    </h2>

                    <p className="text-slate-500 mt-2">

                        Ingresa nueva mercadería al inventario.

                    </p>

                </div>

            </div>

            <div className="grid gap-5">

                <input
                    placeholder="Proveedor"
                    className="border rounded-xl p-3"
                />

                <input
                    placeholder="Número factura"
                    className="border rounded-xl p-3"
                />

                <textarea
                    placeholder="Observaciones"
                    rows={3}
                    className="border rounded-xl p-3"
                />

                        <select
    value={detail.product_id}
    onChange={(e)=>
        setDetail({
            ...detail,
            product_id:e.target.value
        })
    }
    className="border rounded-xl p-3"
>

<option value="">
    Seleccionar producto
</option>

{
products.map(product=>(
<option
    key={product.id}
    value={product.id}
>
    {product.name}
</option>
))
}

</select>

                 </AdminCard>

            </>

    );


}
