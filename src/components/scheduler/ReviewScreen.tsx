import { Button } from "@/components/ui/button";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { Match } from "./MatchCard";
import { League, Team, Channel, Commentator } from "@/pages/Scheduler";

interface ReviewScreenProps {
  matches: Match[];
  sending: boolean;
  onBack: () => void;
  onConfirm: () => void;
  leagues: League[];
  teams: Team[];
  channels: Channel[];
  commentators: Commentator[];
}

const ReviewScreen = ({ matches, sending, onBack, onConfirm, leagues, teams, channels, commentators }: ReviewScreenProps) => {

  const getNameById = (collection: any[], id: string) => {
    const item = collection.find(item => item.id === id);
    return item ? item.name_ar : "غير محدد";
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={onBack}>
                <ArrowLeft className="w-5 h-5 ml-2" />
                <span>رجوع</span>
            </Button>
            <h1 className="text-xl md:text-2xl font-bold neon-text">مراجعة الجدول</h1>
            <div className="w-16"></div>
        </div>

        <div className="space-y-4">
            {matches.map((match, index) => (
                <div key={match.id} className="glass-card p-4 text-sm md:text-base">
                    <div className="flex justify-between items-center font-bold border-b border-white/10 pb-2 mb-3">
                        <span className="text-primary">المباراة #{index + 1}</span>
                        <div className="text-right">
                            <div>{match.date}</div>
                            <div className="text-xs">{match.time}</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 items-center text-center gap-2 mb-3">
                        <div className="flex flex-col items-center">
                            <img src={teams.find(t=>t.id === match.homeTeamId)?.logo_url || ''} alt="Home team logo" className="w-10 h-10 object-contain mb-1"/>
                            <span className="font-semibold">{getNameById(teams, match.homeTeamId)}</span>
                        </div>
                        <div className="font-black text-xl text-muted-foreground">VS</div>
                        <div className="flex flex-col items-center">
                             <img src={teams.find(t=>t.id === match.awayTeamId)?.logo_url || ''} alt="Away team logo" className="w-10 h-10 object-contain mb-1"/>
                            <span className="font-semibold">{getNameById(teams, match.awayTeamId)}</span>
                        </div>
                    </div>
                    <div className="text-xs text-muted-foreground text-center border-t border-white/10 pt-2">
                        <p>{getNameById(leagues, match.leagueId)}</p>
                        <p>القناة: {getNameById(channels, match.channelId)}</p>
                        <p>المعلق: {getNameById(commentators, match.commentatorId)}</p>
                    </div>
                </div>
            ))}
        </div>

        <Button onClick={onConfirm} disabled={sending} className="w-full mt-6" size="lg">
            {sending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
                <Send className="w-5 h-5 ml-2" />
            )}
            <span>تأكيد وإرسال</span>
        </Button>
    </div>
  );
};

export default ReviewScreen;
