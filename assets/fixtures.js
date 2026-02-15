(function generateFixtures() {
  if (!window.teams || window.teams.length === 0) {
    console.error("Teams not loaded. Make sure teams.js is loaded first.");
    return;
  }

  const fixtures = [];
  const DAYS_TO_GENERATE = 5;
  const MATCHES_PER_DAY = 2;
  const COURTS = ["Court A", "Court B", "Court C"];
  const TIMES = ["18:00", "19:00", "20:00"];

  // Group teams by division
  const divisions = window.teams.reduce((acc, team) => {
    acc[team.division] = acc[team.division] || [];
    acc[team.division].push(team.name);
    return acc;
  }, {});

  let matchweek = 1;

  for (let d = 0; d < DAYS_TO_GENERATE; d++) {
    const dateObj = new Date();
    dateObj.setDate(dateObj.getDate() + d);

    const dateStr = dateObj.toLocaleDateString("en-US", {
      weekday: "short",
      day: "2-digit",
      month: "short"
    });

    Object.keys(divisions).forEach((division) => {
      const teams = [...divisions[division]];

      // Shuffle teams (simple Fisher–Yates)
      for (let i = teams.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [teams[i], teams[j]] = [teams[j], teams[i]];
      }

      for (let i = 0; i < teams.length - 1 && i / 2 < MATCHES_PER_DAY; i += 2) {
        fixtures.push({
          date: dateStr,
          matchweek: String(matchweek),
          homeTeam: teams[i],
          awayTeam: teams[i + 1],
          homeScore: null,
          awayScore: null,
          status: "UPCOMING",
          time: TIMES[Math.floor(Math.random() * TIMES.length)],
          location: COURTS[Math.floor(Math.random() * COURTS.length)],
          liveBlog: false
        });
      }
    });

    matchweek++;
  }

  window.fixtures = fixtures;
})();
