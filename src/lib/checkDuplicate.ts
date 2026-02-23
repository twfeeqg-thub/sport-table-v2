import { supabase } from "@/lib/supabase";

export async function checkDuplicate(table: string, name: string): Promise<boolean> {
  const { data } = await supabase
    .from(table)
    .select("id")
    .ilike("name", name.trim())
    .limit(1);
  return (data?.length ?? 0) > 0;
}
