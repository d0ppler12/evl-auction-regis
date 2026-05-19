import { supabaseAdmin } from '@/lib/supabase-admin'

export async function recalculateStandings() {
  const { data: teams } = await supabaseAdmin.from('teams').select('id')
  const { data: matches } = await supabaseAdmin
    .from('matches')
    .select('*')
    .eq('status', 'completed')

  const standings = new Map<
    string,
    { played: number; wins: number; losses: number; sets_won: number; sets_lost: number; points: number }
  >()

  for (const team of teams || []) {
    standings.set(team.id, { played: 0, wins: 0, losses: 0, sets_won: 0, sets_lost: 0, points: 0 })
  }

  for (const match of matches || []) {
    const a = standings.get(match.team_a_id)
    const b = standings.get(match.team_b_id)
    if (!a || !b) continue

    a.played += 1
    b.played += 1
    a.sets_won += match.sets_team_a || 0
    a.sets_lost += match.sets_team_b || 0
    b.sets_won += match.sets_team_b || 0
    b.sets_lost += match.sets_team_a || 0

    if ((match.sets_team_a || 0) > (match.sets_team_b || 0)) {
      a.wins += 1
      b.losses += 1
      a.points += 3
    } else if ((match.sets_team_b || 0) > (match.sets_team_a || 0)) {
      b.wins += 1
      a.losses += 1
      b.points += 3
    }
  }

  for (const [teamId, row] of Array.from(standings.entries())) {
    await supabaseAdmin.from('team_standings').upsert({
      team_id: teamId,
      ...row,
      updated_at: new Date().toISOString(),
    })
  }

  return standings
}
