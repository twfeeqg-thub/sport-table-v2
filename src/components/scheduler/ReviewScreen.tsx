import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Send, Loader2 } from "lucide-react";
import type { Match } from "./MatchCard";
import { useCountries, useLeagues, useTeams, useChannels, useCommentators } from "@/hooks/useSchedulerData";

interface ReviewScreenProps {
  matches: Match[];
  sending: boolean;
  onBack: () => void;
  onConfirm: () => void;
}

const MatchSummaryRow = ({ match, index }: { match: Match; index: number }) => {
  const { countries } = useCountries();
  const { leagues } = useLeagues(match.countryCode);
  const { teams } = useTeams(match.leagueId);
  const { channels } = useChannels();
  const { commentators } = useCommentators();

  const country = countries.find((c) => c.code === match.countryCode);
  const league = leagues.find((l) => l.id === match.leagueId);
  const home = teams.find((t) => t.id === match.homeTeamId);
  const away = teams.find((t) => t.id === match.awayTeamId);
  const channel = channels.find((c) => c.id === match.channelId);
  const commentator = commentators.find((c) => c.id === match.commentatorId);

  return (
    <div className="flex flex-col gap-2 p-3 rounded-lg bg-secondary/50">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">مباراة {index + 1}</span>
        <span className="text-xs text-muted-foreground">{match.date} • {match.time}</span>
      </div>
      <div className="flex items-center justify-center gap-3 text-sm font-bold">
        {home?.logo_url && <img src={home.logo_url} className="w-6 h-6 rounded object-contain" />}
        <span>{home?.name_ar || "—"}</span>
        <span className="text-primary font-black">ضد</span>
        <span>{away?.name_ar || "—"}</span>
        {away?.logo_url && <img src={away.logo_url} className="w-6 h-6 rounded object-contain" />}
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground justify-center">
        {league && (
          <span className="flex items-center gap-1">
            {league.logo_url && <img src={league.logo_url} className="w-4 h-4 rounded object-contain" />}
            {league.name_ar}
          </span>
        )}
        {channel && <span>📺 {channel.name_ar}</span>}
        {commentator && <span>🎙️ {commentator.name_ar}</span>}
      </div>
    </div>
  );
};

const ReviewScreen = ({ matches, sending, onBack, onConfirm }: ReviewScreenProps) => {
  // Group matches by leagueId
  const grouped = matches.reduce<Record<string, Match[]>>((acc, m) => {
    const key = m.leagueId || "unknown";
    (acc[key] = acc[key] || []).push(m);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground">
          <ArrowRight className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold neon-text">مراجعة الجدولة</h2>
          <p className="text-sm text-muted-foreground">{matches.length} مباراة جاهزة للإرسال</p>
        </div>
      </div>

      {Object.entries(grouped).map(([, groupMatches]) => (
        <GlassCard key={groupMatches[0].leagueId}>
          <div className="space-y-3">
            {groupMatches.map((match, i) => (
              <MatchSummaryRow key={match.id} match={match} index={i} />
            ))}
          </div>
        </GlassCard>
      ))}

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ArrowRight className="w-4 h-4 ml-2" />
          تعديل
        </Button>
        <Button onClick={onConfirm} disabled={sending} className="flex-1">
          {sending ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Send className="w-4 h-4 ml-2" />}
          تأكيد وإرسال
        </Button>
      </div>
    </div>
  );
};

export default ReviewScreen;
