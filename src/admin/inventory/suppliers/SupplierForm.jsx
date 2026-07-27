import { useState } from "react";

export default function SupplierForm({
    initialValues,
    onSubmit,
    onCancel
}) {

    const [form, setForm] = useState(
        initialValues ?? {

            name: "",

            rut: "",

            contact_name: "",

            phone: "",

            email: "",

            address: "",

            city: "",

            region: "",

            notes: ""

        }
    );

    function handleChange(e) {

        setForm({

            ...form,

            [e.target.name]: e.target.value

        });

    }

    function handleSubmit(e) {

        e.preventDefault();

        onSubmit(form);

    }

    return (

        <form
            onSubmit={handleSubmit}
            className="space-y-4"
        >

            <input
                name="name"
                placeholder="Proveedor"
                value={form.name}
                onChange={handleChange}
                required
            />

            <input
                name="rut"
                placeholder="RUT"
                value={form.rut}
                onChange={handleChange}
            />

            <input
                name="contact_name"
                placeholder="Contacto"
                value={form.contact_name}
                onChange={handleChange}
            />

            <input
                name="phone"
                placeholder="Teléfono"
                value={form.phone}
                onChange={handleChange}
            />

            <input
                name="email"
                placeholder="Correo"
                value={form.email}
                onChange={handleChange}
            />

            <button type="submit">

                Guardar

            </button>

        </form>

    );

}
