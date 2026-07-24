import { supabase } from "@/supabaseClient";

class ApiClient {

    constructor() {

        this.db = supabase;

    }

}

export default new ApiClient();
