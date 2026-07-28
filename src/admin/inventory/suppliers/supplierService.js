import { supabase } from "../../../supabaseClient";

export async function getSuppliers() {

    const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .order("name");

    if (error) throw error;

    return data;

}

export async function createSupplier(values) {

    const { data, error } = await supabase
        .from("suppliers")
        .insert(values)
        .select()
        .single();

    if (error) throw error;

    return data;

}

export async function updateSupplier(id, values) {

    const { data, error } = await supabase
        .from("suppliers")
        .update(values)
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;

    return data;

}

export async function deleteSupplier(id) {

    const { error } = await supabase
        .from("suppliers")
        .update({
            active: false
        })
        .eq("id", id);

    if (error) throw error;

}

export async function getActiveSuppliers() {

    const { data, error } = await supabase
        .from("suppliers")
        .select("id, name")
        .eq("active", true)
        .order("name");

    if (error) throw error;

    return data;
}
