import { supabase } from "@/lib/supabase";

export async function checkDuplicate(table: string, column: string, value: string): Promise<boolean> {
  const { data } = await supabase
    .from(table)
    .select("id")
    .ilike(column, value.trim())
    .limit(1);
  return (data?.length ?? 0) > 0;
}
