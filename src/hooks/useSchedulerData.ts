import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

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

export function useLeagueCountries() {
  const [countries, setCountries] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("leagues")
      .select("country_code")
      .then(({ data }) => {
        const unique = [...new Set((data || []).map((d) => d.country_code).filter(Boolean))];
        setCountries(unique.sort());
        setLoading(false);
      });
  }, []);

  return { countries, loading };
}

export function useLeagues(countryCode: string) {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!countryCode) {
      setLeagues([]);
      return;
    }
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

export function useTeams(leagueId: string) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!leagueId) {
      setTeams([]);
      return;
    }
    setLoading(true);
    supabase
      .from("teams")
      .select("id, name_ar, logo_url, league_id")
      .eq("league_id", leagueId)
      .then(({ data }) => {
        setTeams(data || []);
        setLoading(false);
      });
  }, [leagueId]);

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
