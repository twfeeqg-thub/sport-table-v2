import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface Country {
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
}

export interface Channel {
  id: string;
  name_ar: string;
  logo_url: string | null;
}

export interface Commentator {
  id: string;
  name_ar: string;
}

export function useCountries() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("countries")
      .select("code, name_ar, flag_emoji")
      .order("name_ar")
      .then(({ data }) => {
        setCountries(data || []);
        setLoading(false);
      });
  }, []);

  return { countries, loading };
}

export function useLeagues(countryCode: string) {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!countryCode) { setLeagues([]); return; }
    setLoading(true);
    supabase
      .from("leagues")
      .select("id, name_ar, logo_url, country_code")
      .eq("country_code", countryCode)
      .then(({ data }) => {
        setLeagues(data || []);
        setLoading(false);
      });
  }, [countryCode]);

  return { leagues, loading };
}

export function useTeams(leagueId: string, countryCode?: string) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!leagueId && !countryCode) { setTeams([]); return; }
    setLoading(true);
    let query = supabase.from("teams").select("id, name_ar, logo_url, league_id");
    if (leagueId) {
      query = query.eq("league_id", leagueId);
    } else if (countryCode) {
      query = query.eq("country_code", countryCode);
    }
    query.then(({ data }) => {
      setTeams(data || []);
      setLoading(false);
    });
  }, [leagueId, countryCode]);

  return { teams, loading };
}

export function useChannels() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("channels")
      .select("id, name_ar, logo_url")
      .then(({ data }) => {
        setChannels(data || []);
        setLoading(false);
      });
  }, []);

  return { channels, loading };
}

export function useCommentators() {
  const [commentators, setCommentators] = useState<Commentator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("commentators")
      .select("id, name_ar")
      .then(({ data }) => {
        setCommentators(data || []);
        setLoading(false);
      });
  }, []);

  return { commentators, loading };
}
