import { useState } from "react";
import Layout from "@/components/Layout";
import GlassCard from "@/components/GlassCard";
import { FormField } from "@/components/FormComponents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarDays, Plus, Send, Trash2, Loader2 } from "lucide-react";
import { N8N_WEBHOOK_URL } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import LogoSelect from "@/components/LogoSelect";
import {
  useLeagueCountries,
  useLeagues,
  useTeams,
  useChannels,
  useCommentators,
} from "@/hooks/useSchedulerData";
import { COUNTRIES } from "@/lib/countries";

interface Match {
  id: string;
  countryCode: string;
  leagueId: string;
  homeTeamId: string;
  awayTeamId: string;
  date: string;
  time: string;
  channelId: string;
  commentatorId: string;
}

const createEmptyMatch = (): Match => ({
  id: crypto.randomUUID(),
  countryCode: "",
  leagueId: "",
  homeTeamId: "",
  awayTeamId: "",
  date: "",
  time: "",
  channelId: "",
  commentatorId: "",
});

const MatchCard = ({
  match,
  index,
  canDelete,
  onUpdate,
  onRemove,
}: {
  match: Match;
  index: number;
  canDelete: boolean;
  onUpdate: (field: keyof Match, value: string) => void;
  onRemove: () => void;
}) => {
  const { countries } = useLeagueCountries();
  const { leagues } = useLeagues(match.countryCode);
  const { teams } = useTeams(match.leagueId);
  const { channels } = useChannels();
  const { commentators } = useCommentators();

  const countryOptions = countries.map((code) => {
    const c = COUNTRIES.find((x) => x.code === code);
    return { value: code, label: c ? c.name : code };
  });

  const leagueOptions = leagues.map((l) => ({
    value: l.id,
    label: l.name_ar,
    logoUrl: l.logo_url,
  }));

  const teamOptions = teams.map((t) => ({
    value: t.id,
    label: t.name_ar,
    logoUrl: t.logo_url,
  }));

  const channelOptions = channels.map((ch) => ({
    value: ch.id,
    label: ch.name_ar,
    logoUrl: ch.logo_url,
  }));

  const commentatorOptions = commentators.map((cm) => ({
    value: cm.id,
    label: cm.name_ar,
  }));

  const handleCountryChange = (val: string) => {
    onUpdate("countryCode", val);
    onUpdate("leagueId", "");
    onUpdate("homeTeamId", "");
    onUpdate("awayTeamId", "");
  };

  const handleLeagueChange = (val: string) => {
    onUpdate("leagueId", val);
    onUpdate("homeTeamId", "");
    onUpdate("awayTeamId", "");
  };

  return (
    <GlassCard className="relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-primary">المباراة {index + 1}</h3>
        {canDelete && (
          <button
            onClick={onRemove}
            className="text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <FormField label="الدولة" required>
          <LogoSelect
            value={match.countryCode}
            onValueChange={handleCountryChange}
            options={countryOptions}
            placeholder="اختر الدولة"
          />
        </FormField>

        <FormField label="الدوري" required>
          <LogoSelect
            value={match.leagueId}
            onValueChange={handleLeagueChange}
            options={leagueOptions}
            placeholder="اختر الدوري"
            disabled={!match.countryCode}
          />
        </FormField>

        <FormField label="الفريق المضيف" required>
          <LogoSelect
            value={match.homeTeamId}
            onValueChange={(v) => onUpdate("homeTeamId", v)}
            options={teamOptions}
            placeholder="اختر الفريق المضيف"
            disabled={!match.leagueId}
          />
        </FormField>

        <FormField label="الفريق الضيف" required>
          <LogoSelect
            value={match.awayTeamId}
            onValueChange={(v) => onUpdate("awayTeamId", v)}
            options={teamOptions}
            placeholder="اختر الفريق الضيف"
            disabled={!match.leagueId}
          />
        </FormField>

        <FormField label="التاريخ" required>
          <Input
            type="date"
            value={match.date}
            onChange={(e) => onUpdate("date", e.target.value)}
            className="bg-secondary border-border text-foreground"
          />
        </FormField>

        <FormField label="الوقت" required>
          <Input
            type="time"
            value={match.time}
            onChange={(e) => onUpdate("time", e.target.value)}
            className="bg-secondary border-border text-foreground"
          />
        </FormField>

        <FormField label="القناة">
          <LogoSelect
            value={match.channelId}
            onValueChange={(v) => onUpdate("channelId", v)}
            options={channelOptions}
            placeholder="اختر القناة"
          />
        </FormField>

        <FormField label="المعلق">
          <LogoSelect
            value={match.commentatorId}
            onValueChange={(v) => onUpdate("commentatorId", v)}
            options={commentatorOptions}
            placeholder="اختر المعلق"
          />
        </FormField>
      </div>
    </GlassCard>
  );
};

const Scheduler = () => {
  const [matches, setMatches] = useState<Match[]>([createEmptyMatch()]);
  const [sending, setSending] = useState(false);

  const addMatch = () => setMatches([...matches, createEmptyMatch()]);

  const removeMatch = (id: string) => {
    if (matches.length === 1) return;
    setMatches(matches.filter((m) => m.id !== id));
  };

  const updateMatch = (id: string, field: keyof Match, value: string) => {
    setMatches(matches.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  const handleSend = async () => {
    const incomplete = matches.some(
      (m) => !m.homeTeamId || !m.awayTeamId || !m.date || !m.time || !m.leagueId
    );
    if (incomplete) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة لكل مباراة",
        variant: "destructive",
      });
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

      toast({
        title: "تم الإرسال",
        description: `تم إرسال ${matches.length} مباراة بنجاح إلى نظام الجدولة`,
      });
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
            <MatchCard
              key={match.id}
              match={match}
              index={index}
              canDelete={matches.length > 1}
              onUpdate={(field, value) => updateMatch(match.id, field, value)}
              onRemove={() => removeMatch(match.id)}
            />
          ))}
        </div>

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
