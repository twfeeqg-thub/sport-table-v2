
import { Trash2, GripVertical } from "lucide-react";
import SearchableSelector, { SelectorOption } from "@/components/SearchableSelector";
import { Country, League, Team, Channel, Commentator } from "@/pages/Scheduler";
import { cn } from "@/lib/utils"; // [ADD-ON] Missing import has been added to fix the error.

export interface Match {
  id: string;
  countryCode: string;
  homeTeamId: string;
  awayTeamId: string;
  leagueId: string;
  channelId: string;
  commentatorId: string;
  date: string;
  time: string;
}

export const createEmptyMatch = (): Match => ({
  id: crypto.randomUUID(),
  countryCode: "",
  homeTeamId: "",
  awayTeamId: "",
  leagueId: "",
  channelId: "",
  commentatorId: "",
  date: "",
  time: "",
});

interface MatchCardProps {
  match: Match;
  index: number;
  canDelete: boolean;
  onUpdate: (id: string, field: keyof Match, value: string) => void;
  onRemove: () => void;
  countries: Country[];
  leagues: League[];
  teams: Team[];
  channels: Channel[];
  commentators: Commentator[];
}

const MatchCard = ({ 
  match, 
  onUpdate, 
  onRemove, 
  canDelete,
  countries,
  leagues,
  teams,
  channels,
  commentators
}: MatchCardProps) => {

  // [ADD-ON] The Gatekeeper: Lock fields if the date is not set
  const isLocked = !match.date;

  // [ADD-ON] Centralized class for unified height
  const fieldClassName = "h-12";

  // [ADD-ON] Enhanced data mapping for the SearchableSelector
  const countryOptions: SelectorOption[] = countries.map(c => ({ 
    value: c.code, 
    label: c.name_ar,
    logo_url: `https://flagcdn.com/w320/${c.code.toLowerCase()}.png`
  }));

  const filteredLeagues: SelectorOption[] = leagues
    .filter(l => l.country_code === match.countryCode)
    .map(l => ({ value: l.id, label: l.name_ar, logo_url: l.logo_url }));

  const filteredTeams: SelectorOption[] = teams
    .filter(t => t.league_id === match.leagueId)
    .map(t => ({ value: t.id, label: t.name_ar, logo_url: t.logo_url }));

  const channelOptions: SelectorOption[] = channels.map(c => ({ 
    value: c.id, 
    label: c.name_ar, 
    logo_url: c.logo_url 
  }));

  const commentatorOptions: SelectorOption[] = commentators.map(c => ({ 
    value: c.id, 
    label: c.name_ar, 
    logo_url: c.image_url
  }));

  return (
    <div className="glass-card p-4 relative overflow-hidden">
      <div className="grid grid-cols-2 gap-2 mb-4 border-b border-white/10 pb-4">
         <input
          type="date"
          value={match.date}
          onChange={(e) => onUpdate(match.id, "date", e.target.value)}
          className={cn(
            "w-full bg-slate-200/50 dark:bg-slate-800/60 text-foreground font-bold text-center rounded-lg border-slate-200/50 dark:border-slate-700/50 shadow-sm focus:ring-2 focus:ring-primary focus:border-primary/5 transition-all",
            fieldClassName
          )}
        />
        <input
          type="time"
          value={match.time}
          onChange={(e) => onUpdate(match.id, "time", e.target.value)}
          className={cn(
            "w-full bg-slate-200/50 dark:bg-slate-800/60 text-foreground font-bold text-center rounded-lg border-slate-200/50 dark:border-slate-700/50 shadow-sm focus:ring-2 focus:ring-primary focus:border-primary/5 transition-all",
            fieldClassName
            )}
            disabled={isLocked}
        />
      </div>

      <div className="flex items-center gap-2 mb-4">
        <GripVertical className="w-5 h-5 text-muted-foreground self-start mt-3" />
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <SearchableSelector
            options={countryOptions}
            value={match.countryCode}
            onChange={(value) => onUpdate(match.id, "countryCode", value)}
            placeholder="اختر الدولة"
            searchPlaceholder="...ابحث عن دولة"
            emptyText="لا توجد دول"
            disabled={isLocked}
            showLogo={true}
            className={fieldClassName}
          />
          <SearchableSelector
            options={filteredLeagues}
            value={match.leagueId}
            onChange={(value) => onUpdate(match.id, "leagueId", value)}
            placeholder="اختر البطولة"
            searchPlaceholder="...ابحث عن بطولة"
            emptyText="اختر دولة أولاً"
            disabled={isLocked || !match.countryCode}
            showLogo={true}
            className={fieldClassName}
          />
        </div>
         {canDelete && (
          <button onClick={onRemove} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full transition-colors self-start mt-1">
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 items-center text-center gap-4 mb-4">
        <SearchableSelector
            options={filteredTeams}
            value={match.homeTeamId}
            onChange={(value) => onUpdate(match.id, "homeTeamId", value)}
            placeholder="الفريق A"
            searchPlaceholder="...ابحث عن فريق"
            emptyText="اختر بطولة أولاً"
            disabled={isLocked || !match.leagueId}
            showLogo={true}
            className={fieldClassName}
        />
        <div className="font-black text-2xl text-muted-foreground">VS</div>
         <SearchableSelector
            options={filteredTeams}
            value={match.awayTeamId}
            onChange={(value) => onUpdate(match.id, "awayTeamId", value)}
            placeholder="الفريق B"
            searchPlaceholder="...ابحث عن فريق"
            emptyText="اختر بطولة أولاً"
            disabled={isLocked || !match.leagueId}
            showLogo={true}
            className={fieldClassName}
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <SearchableSelector
            options={channelOptions}
            value={match.channelId}
            onChange={(value) => onUpdate(match.id, "channelId", value)}
            placeholder="اختر القناة"
            searchPlaceholder="...ابحث عن قناة"
            emptyText="لا توجد قنوات"
            disabled={isLocked}
            showLogo={true}
            className={fieldClassName}
        />
        <SearchableSelector
            options={commentatorOptions}
            value={match.commentatorId}
            onChange={(value) => onUpdate(match.id, "commentatorId", value)}
            placeholder="اختر المعلق"
            searchPlaceholder="...ابحث عن معلق"
            emptyText="لا يوجد معلقين"
            disabled={isLocked}
            showLogo={true}
            className={fieldClassName}
        />
      </div>

      <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-primary/20 rounded-full blur-2xl pointer-events-none" />
    </div>
  );
};

export default MatchCard;
