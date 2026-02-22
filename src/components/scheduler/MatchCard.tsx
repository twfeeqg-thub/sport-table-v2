import GlassCard from "@/components/GlassCard";
import { FormField } from "@/components/FormComponents";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import LogoSelect from "@/components/LogoSelect";
import {
  useCountries,
  useLeagues,
  useTeams,
  useChannels,
  useCommentators,
} from "@/hooks/useSchedulerData";

export interface Match {
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

export const createEmptyMatch = (): Match => ({
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

interface MatchCardProps {
  match: Match;
  index: number;
  canDelete: boolean;
  onUpdate: (field: keyof Match, value: string) => void;
  onRemove: () => void;
}

const MatchCard = ({ match, index, canDelete, onUpdate, onRemove }: MatchCardProps) => {
  const { countries } = useCountries();
  const { leagues } = useLeagues(match.countryCode);
  const { teams } = useTeams(match.leagueId);
  const { channels } = useChannels();
  const { commentators } = useCommentators();

  const countryOptions = countries.map((c) => ({
    value: c.code,
    label: `${c.flag_emoji} ${c.name_ar}`,
  }));

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
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-primary">المباراة {index + 1}</h3>
        {canDelete && (
          <button onClick={onRemove} className="text-muted-foreground hover:text-destructive transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormField label="الدولة" required>
          <LogoSelect value={match.countryCode} onValueChange={handleCountryChange} options={countryOptions} placeholder="اختر الدولة" />
        </FormField>

        <FormField label="الدوري" required>
          <LogoSelect value={match.leagueId} onValueChange={handleLeagueChange} options={leagueOptions} placeholder="اختر الدوري" disabled={!match.countryCode} />
        </FormField>

        <FormField label="الفريق المضيف" required>
          <LogoSelect value={match.homeTeamId} onValueChange={(v) => onUpdate("homeTeamId", v)} options={teamOptions} placeholder="اختر الفريق" disabled={!match.leagueId} />
        </FormField>

        <FormField label="الفريق الضيف" required>
          <LogoSelect value={match.awayTeamId} onValueChange={(v) => onUpdate("awayTeamId", v)} options={teamOptions} placeholder="اختر الفريق" disabled={!match.leagueId} />
        </FormField>

        <FormField label="التاريخ" required>
          <Input type="date" value={match.date} onChange={(e) => onUpdate("date", e.target.value)} className="bg-secondary border-border text-foreground" />
        </FormField>

        <FormField label="الوقت" required>
          <Input type="time" value={match.time} onChange={(e) => onUpdate("time", e.target.value)} className="bg-secondary border-border text-foreground" />
        </FormField>

        <FormField label="القناة">
          <LogoSelect value={match.channelId} onValueChange={(v) => onUpdate("channelId", v)} options={channelOptions} placeholder="اختر القناة" />
        </FormField>

        <FormField label="المعلق">
          <LogoSelect value={match.commentatorId} onValueChange={(v) => onUpdate("commentatorId", v)} options={commentatorOptions} placeholder="اختر المعلق" />
        </FormField>
      </div>
    </GlassCard>
  );
};

export default MatchCard;
