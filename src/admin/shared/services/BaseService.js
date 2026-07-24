import ApiClient from "@/admin/shared/api/ApiClient";

export default class BaseService {

    constructor(table) {
        this.table = table;
    }

    async getAll() {

        const { data, error } = await supabase
            .from(this.table)
            .select("*");

        if (error) throw error;

        return data;

    }

    async getById(id) {

        const { data, error } = await supabase
            .from(this.table)
            .select("*")
            .eq("id", id)
            .single();

        if (error) throw error;

        return data;

    }

    async create(values) {

        const { data, error } = await supabase
            .from(this.table)
            .insert(values)
            .select()
            .single();

        if (error) throw error;

        return data;

    }

    async update(id, values) {

        const { data, error } = await supabase
            .from(this.table)
            .update(values)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        return data;

    }

    async delete(id) {

        const { error } = await supabase
            .from(this.table)
            .delete()
            .eq("id", id);

        if (error) throw error;

        return true;

    }

}
