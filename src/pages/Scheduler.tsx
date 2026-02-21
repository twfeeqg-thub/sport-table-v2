import { useState } from "react";
import Layout from "@/components/Layout";
import GlassCard from "@/components/GlassCard";
import { FormField, StyledInput } from "@/components/FormComponents";
import { Button } from "@/components/ui/button";
import { CalendarDays, Plus, Send, Trash2, Loader2 } from "lucide-react";
import { N8N_WEBHOOK_URL } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  tournament: string;
  channel: string;
  commentator: string;
}

const createEmptyMatch = (): Match => ({
  id: crypto.randomUUID(),
  homeTeam: "",
  awayTeam: "",
  date: "",
  time: "",
  tournament: "",
  channel: "",
  commentator: "",
});

const Scheduler = () => {
  const [matches, setMatches] = useState<Match[]>([createEmptyMatch()]);
  const [sending, setSending] = useState(false);

  const addMatch = () => {
    setMatches([...matches, createEmptyMatch()]);
  };

  const removeMatch = (id: string) => {
    if (matches.length === 1) return;
    setMatches(matches.filter((m) => m.id !== id));
  };

  const updateMatch = (id: string, field: keyof Match, value: string) => {
    setMatches(matches.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  const handleSend = async () => {
    // Validate
    const incomplete = matches.some(
      (m) => !m.homeTeam.trim() || !m.awayTeam.trim() || !m.date || !m.time
    );
    if (incomplete) {
      toast({ title: "خطأ", description: "يرجى ملء الفرق والتاريخ والوقت لجميع المباريات", variant: "destructive" });
      return;
    }

    setSending(true);
    try {
      const payload = {
        matches: matches.map(({ id, ...rest }) => rest),
        sentAt: new Date().toISOString(),
      };

      const res = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      toast({ title: "تم الإرسال", description: `تم إرسال ${matches.length} مباراة بنجاح إلى نظام الجدولة` });
      setMatches([createEmptyMatch()]);
    } catch (error: any) {
      toast({ title: "خطأ في الإرسال", description: error.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold neon-text mb-1 flex items-center gap-3">
              <CalendarDays className="w-7 h-7" />
              مجدول المباريات
            </h1>
            <p className="text-muted-foreground">بناء جدول المباريات وإرساله بضغطة واحدة</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={addMatch} className="border-border text-foreground">
              <Plus className="w-4 h-4 ml-2" />
              إضافة مباراة
            </Button>
            <Button onClick={handleSend} disabled={sending}>
              {sending ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Send className="w-4 h-4 ml-2" />}
              إرسال الجدولة
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {matches.map((match, index) => (
            <GlassCard key={match.id} className="relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-primary">
                  المباراة {index + 1}
                </h3>
                {matches.length > 1 && (
                  <button
                    onClick={() => removeMatch(match.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField label="الفريق المضيف" required>
                  <StyledInput
                    value={match.homeTeam}
                    onChange={(e) => updateMatch(match.id, "homeTeam", e.target.value)}
                    placeholder="الفريق المضيف"
                  />
                </FormField>

                <FormField label="الفريق الضيف" required>
                  <StyledInput
                    value={match.awayTeam}
                    onChange={(e) => updateMatch(match.id, "awayTeam", e.target.value)}
                    placeholder="الفريق الضيف"
                  />
                </FormField>

                <FormField label="البطولة">
                  <StyledInput
                    value={match.tournament}
                    onChange={(e) => updateMatch(match.id, "tournament", e.target.value)}
                    placeholder="اسم البطولة"
                  />
                </FormField>

                <FormField label="التاريخ" required>
                  <StyledInput
                    type="date"
                    value={match.date}
                    onChange={(e) => updateMatch(match.id, "date", e.target.value)}
                  />
                </FormField>

                <FormField label="الوقت" required>
                  <StyledInput
                    type="time"
                    value={match.time}
                    onChange={(e) => updateMatch(match.id, "time", e.target.value)}
                  />
                </FormField>

                <FormField label="القناة">
                  <StyledInput
                    value={match.channel}
                    onChange={(e) => updateMatch(match.id, "channel", e.target.value)}
                    placeholder="القناة الناقلة"
                  />
                </FormField>

                <FormField label="المعلق">
                  <StyledInput
                    value={match.commentator}
                    onChange={(e) => updateMatch(match.id, "commentator", e.target.value)}
                    placeholder="اسم المعلق"
                  />
                </FormField>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Summary */}
        <GlassCard className="gradient-neon">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">إجمالي المباريات</p>
              <p className="text-2xl font-bold text-foreground">{matches.length}</p>
            </div>
            <Button onClick={handleSend} disabled={sending} size="lg">
              {sending ? <Loader2 className="w-5 h-5 animate-spin ml-2" /> : <Send className="w-5 h-5 ml-2" />}
              إرسال الجدولة
            </Button>
          </div>
        </GlassCard>
      </div>
    </Layout>
  );
};

export default Scheduler;
