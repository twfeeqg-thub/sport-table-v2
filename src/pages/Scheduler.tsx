
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { CalendarDays, Plus, Eye, Loader2 } from "lucide-react";
import { N8N_WEBHOOK_URL, supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import MatchCard, { Match, createEmptyMatch } from "@/components/scheduler/MatchCard";
import ReviewScreen from "@/components/scheduler/ReviewScreen";

type Step = "build" | "review";

// Types matching the ACTUAL database schema
export interface Country {
  id: number;
  code: string;
  name_ar: string;
  flag_emoji: string;
}

export interface League {
  id: string;
  name_ar: string;
  logo_url: string | null;
  country_code: string;
}

export interface Team {
  id: string;
  name_ar: string;
  logo_url: string | null;
  league_id: string;
  country_code: string;
}

export interface Channel {
  id: string;
  name_ar: string;
  logo_url: string | null;
}

export interface Commentator {
  id: string;
  name_ar: string;
  image_url: string | null;
}

// Added Profile interface for user data
interface Profile {
    avatar_url: string;
    fb_url: string;
    tw_url: string;
    snap_url: string;
    insta_url: string;
    tele_url: string;
    wa_url: string;
    main_social_platform: string;
}


const Scheduler = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([createEmptyMatch()]);
  const [step, setStep] = useState<Step>("build");
  const [sending, setSending] = useState(false);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);


  // States for all fetched data, as per previous working architecture
  const [countries, setCountries] = useState<Country[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [commentators, setCommentators] = useState<Commentator[]>([]);
  const [loading, setLoading] = useState(true);

  // Effect to fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("avatar_url, fb_url, tw_url, snap_url, insta_url, tele_url, wa_url, main_social_platform")
            .eq("id", user.id)
            .single();

          if (error) {
            console.warn("Could not fetch user profile, proceeding without it.", error.message);
            setUserProfile(null);
          } else {
            setUserProfile(data);
          }
        } catch (error: any) {
          console.error("An unexpected error occurred while fetching user profile:", error.message);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
    };
    fetchUserProfile();
  }, [user]);


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [
          countriesRes,
          leaguesRes,
          teamsRes,
          channelsRes,
          commentatorsRes,
        ] = await Promise.all([
          supabase.from("countries").select("id, name_ar, code, flag_emoji"),
          supabase.from("leagues").select("id, name_ar, logo_url, country_code"),
          supabase.from("teams").select("id, league_id, name_ar, logo_url, country_code"),
          supabase.from("channels").select("id, name_ar, logo_url"),
          supabase.from("commentators").select("id, name_ar, image_url"),
        ]);

        if (countriesRes.error) throw countriesRes.error;
        if (leaguesRes.error) throw leaguesRes.error;
        if (teamsRes.error) throw teamsRes.error;
        if (channelsRes.error) throw channelsRes.error;
        if (commentatorsRes.error) throw commentatorsRes.error;

        setCountries(countriesRes.data || []);
        setLeagues(leaguesRes.data || []);
        setTeams(teamsRes.data || []);
        setChannels(channelsRes.data || []);
        setCommentators(commentatorsRes.data || []);

      } catch (error: any) {
        toast({ title: "خطأ في جلب البيانات", description: error.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const addMatch = () => setMatches([...matches, createEmptyMatch()]);

  const removeMatch = (id: string) => {
    if (matches.length === 1) return;
    setMatches(matches.filter((m) => m.id !== id));
  };

  const updateMatch = (id: string, field: keyof Match, value: string) => {
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const newMatch = { ...m, [field]: value };
          // When a country is chosen, reset the league and teams
          if (field === 'countryCode') {
            newMatch.leagueId = '';
            newMatch.homeTeamId = '';
            newMatch.awayTeamId = '';
          }
          // When a league is chosen, reset the teams
          if (field === 'leagueId') {
            newMatch.homeTeamId = '';
            newMatch.awayTeamId = '';
          }
          return newMatch;
        }
        return m;
      })
    );
  };

  const validateAndReview = () => {
    const incomplete = matches.some(
      (m) => !m.countryCode || !m.homeTeamId || !m.awayTeamId || !m.leagueId || !m.channelId || !m.commentatorId || !m.date || !m.time
    );
    if (incomplete) {
      toast({ title: "خطأ", description: "يرجى ملء جميع الحقول المطلوبة لكل مباراة", variant: "destructive" });
      return;
    }
    setStep("review");
  };

  const handleConfirmSend = async () => {
    setSending(true);
    try {
      const payload = { 
        user_profile: userProfile,
        matches: matches.map(({countryCode, ...rest}) => rest),
        exported_at: new Date().toISOString()
      }; // Exclude countryCode from final payload

      const res = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorBody = await res.text();
        throw new Error(`HTTP ${res.status} - ${res.statusText}. Body: ${errorBody}`);
      }

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
        <ReviewScreen 
            matches={matches} 
            sending={sending} 
            onBack={() => setStep("build")} 
            onConfirm={handleConfirmSend}
            leagues={leagues}
            teams={teams}
            channels={channels}
            commentators={commentators}
        />
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

        {loading ? (
            <div className="flex justify-center items-center p-10">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        ) : (
            <div className="space-y-4">
              {matches.map((match, index) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  index={index}
                  canDelete={matches.length > 1}
                  onUpdate={updateMatch}
                  onRemove={() => removeMatch(match.id)}
                  countries={countries}
                  leagues={leagues}
                  teams={teams}
                  channels={channels}
                  commentators={commentators}
                />
              ))}
            </div>
        )}

        <div className="flex justify-center">
          <button
            onClick={addMatch}
            disabled={loading}
            className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-neon hover:scale-110 transition-transform disabled:opacity-50"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        <Button onClick={validateAndReview} className="w-full" size="lg" disabled={loading}>
          <Eye className="w-5 h-5 ml-2" />
          مراجعة وإرسال ({matches.length})
        </Button>
      </div>
    </Layout>
  );
};

export default Scheduler;
