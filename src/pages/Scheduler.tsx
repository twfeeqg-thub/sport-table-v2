import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { CalendarDays, Plus, Eye, Loader2 } from "lucide-react";
import { N8N_WEBHOOK_URL } from "@/lib/supabase";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import MatchCard, { Match, createEmptyMatch } from "@/components/scheduler/MatchCard";
import ReviewScreen from "@/components/scheduler/ReviewScreen";

type Step = "build" | "review";

const Scheduler = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([createEmptyMatch()]);
  const [step, setStep] = useState<Step>("build");
  const [sending, setSending] = useState(false);

  const addMatch = () => setMatches([...matches, createEmptyMatch()]);

  const removeMatch = (id: string) => {
    if (matches.length === 1) return;
    setMatches(matches.filter((m) => m.id !== id));
  };

  const updateMatch = (id: string, field: keyof Match, value: string) => {
    setMatches((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  const validateAndReview = () => {
    const incomplete = matches.some(
      (m) => !m.homeTeamId || !m.awayTeamId || !m.date || !m.time
    );
    if (incomplete) {
      toast({ title: "خطأ", description: "يرجى ملء جميع الحقول المطلوبة لكل مباراة", variant: "destructive" });
      return;
    }
    setStep("review");
  };

  const resolveMatchData = async (match: Match) => {
    const [teamRes, leagueRes, channelRes, commentatorRes, countryRes] = await Promise.all([
      supabase.from("teams").select("id, name_ar, logo_url").in("id", [match.homeTeamId, match.awayTeamId]),
      match.leagueId ? supabase.from("leagues").select("id, name_ar, logo_url").eq("id", match.leagueId) : Promise.resolve({ data: null }),
      match.channelId ? supabase.from("channels").select("id, name_ar, logo_url").eq("id", match.channelId) : Promise.resolve({ data: null }),
      match.commentatorId ? supabase.from("commentators").select("id, name_ar, image_url").eq("id", match.commentatorId) : Promise.resolve({ data: null }),
      match.countryCode ? supabase.from("countries").select("code, name_ar, flag_emoji").eq("code", match.countryCode) : Promise.resolve({ data: null }),
    ]);

    const teamsMap = (teamRes.data || []).reduce<Record<string, any>>((acc, t) => { acc[t.id] = t; return acc; }, {});

    return {
      date: match.date,
      time: match.time,
      country: countryRes.data?.[0] || null,
      league: leagueRes.data?.[0] || null,
      homeTeam: teamsMap[match.homeTeamId] || { id: match.homeTeamId },
      awayTeam: teamsMap[match.awayTeamId] || { id: match.awayTeamId },
      channel: channelRes.data?.[0] || null,
      commentator: commentatorRes.data?.[0] || null,
    };
  };

  const handleConfirmSend = async () => {
    setSending(true);
    try {
      const enrichedMatches = await Promise.all(matches.map(resolveMatchData));

      const payload = {
        matches: enrichedMatches,
        sentAt: new Date().toISOString(),
        sentBy: { uid: user?.id, email: user?.email, name: user?.user_metadata?.display_name },
      };

      const res = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      toast({ title: "تم الإرسال", description: `تم إرسال ${matches.length} مباراة بنجاح` });
      setMatches([createEmptyMatch()]);
      setStep("build");
    } catch (error: any) {
      toast({ title: "خطأ في الإرسال", description: error.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  if (step === "review") {
    return (
      <Layout>
        <ReviewScreen matches={matches} sending={sending} onBack={() => setStep("build")} onConfirm={handleConfirmSend} />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold neon-text mb-1 flex items-center gap-2">
            <CalendarDays className="w-6 h-6" />
            مجدول المباريات
          </h1>
          <p className="text-sm text-muted-foreground">أضف المباريات ثم راجع وأرسل الجدولة</p>
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

        <div className="flex justify-center">
          <button
            onClick={addMatch}
            className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-neon hover:scale-110 transition-transform"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        <Button onClick={validateAndReview} className="w-full" size="lg">
          <Eye className="w-5 h-5 ml-2" />
          مراجعة وإرسال ({matches.length})
        </Button>
      </div>
    </Layout>
  );
};

export default Scheduler;
