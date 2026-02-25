import { Trash2, GripVertical } from "lucide-react";
import { Country, League, Team, Channel, Commentator } from "@/pages/Scheduler";

// Add countryCode to the Match interface for cascading selects
export interface Match {
  id: string;
  countryCode: string; // Used to filter leagues and teams
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

  const renderSelect = (
    value: string,
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void,
    placeholder: string,
    options: { value: string; label: string; }[],
    disabled?: boolean
  ) => (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="w-full bg-slate-200/50 dark:bg-slate-800/60 text-foreground text-sm rounded-lg border-slate-200/50 dark:border-slate-700/50 shadow-sm focus:ring-2 focus:ring-primary focus:border-primary/5 transition-all disabled:opacity-50"
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );

  // Filter leagues based on the selected country in THIS card
  const filteredLeagues = leagues.filter(l => l.country_code === match.countryCode);

  // Filter teams based on the selected league in THIS card
  const filteredTeams = teams.filter(t => t.league_id === match.leagueId);

  return (
    <div className="glass-card p-4 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-1">
          <GripVertical className="w-5 h-5 text-muted-foreground" />
          {renderSelect(
            match.countryCode,
            (e) => onUpdate(match.id, "countryCode", e.target.value),
            "اختر الدولة", 
            countries.map(c => ({ value: c.code, label: `${c.flag_emoji} ${c.name_ar}` }))
          )}
          {renderSelect(
            match.leagueId, 
            (e) => onUpdate(match.id, "leagueId", e.target.value), 
            "اختر البطولة", 
            filteredLeagues.map(l => ({ value: l.id, label: l.name_ar })),
            !match.countryCode // Disable if no country is selected
          )}
        </div>
        {canDelete && (
          <button onClick={onRemove} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full transition-colors">
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 items-center text-center gap-4 mb-4">
        <div className="space-y-2">
          {renderSelect(
            match.homeTeamId, 
            (e) => onUpdate(match.id, "homeTeamId", e.target.value), 
            "الفريق المضيف", 
            filteredTeams.map(t => ({ value: t.id, label: t.name_ar })),
            !match.leagueId // Disable if no league is selected
          )}
        </div>
        <div className="font-black text-2xl text-muted-foreground">VS</div>
        <div className="space-y-2">
           {renderSelect(
            match.awayTeamId, 
            (e) => onUpdate(match.id, "awayTeamId", e.target.value), 
            "الفريق الضيف", 
            filteredTeams.map(t => ({ value: t.id, label: t.name_ar })),
            !match.leagueId // Disable if no league is selected
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mb-4">
        {renderSelect(
          match.channelId, 
          (e) => onUpdate(match.id, "channelId", e.target.value), 
          "اختر القناة", 
          channels.map(c => ({ value: c.id, label: c.name_ar }))
        )}
        {renderSelect(
          match.commentatorId, 
          (e) => onUpdate(match.id, "commentatorId", e.target.value), 
          "اختر المعلق", 
          commentators.map(c => ({ value: c.id, label: c.name_ar }))
        )}
      </div>

      <div className="flex justify-center gap-2 border-t border-white/10 pt-4">
        <input
          type="date"
          value={match.date}
          onChange={(e) => onUpdate(match.id, "date", e.target.value)}
          className="w-1/2 bg-slate-200/50 dark:bg-slate-800/60 text-foreground font-bold text-center rounded-lg border-slate-200/50 dark:border-slate-700/50 shadow-sm focus:ring-2 focus:ring-primary focus:border-primary/5 transition-all"
        />
        <input
          type="time"
          value={match.time}
          onChange={(e) => onUpdate(match.id, "time", e.target.value)}
          className="w-1/2 bg-slate-200/50 dark:bg-slate-800/60 text-foreground font-bold text-center rounded-lg border-slate-200/50 dark:border-slate-700/50 shadow-sm focus:ring-2 focus:ring-primary focus:border-primary/5 transition-all"
        />
      </div>

      {/* Decorative element */}
      <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
    </div>
  );
};

export default MatchCard;
