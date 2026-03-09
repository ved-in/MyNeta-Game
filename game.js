let pool = [];
let used_indices = new Set();
let correct = 0;
let total = 0;
let streak = 0;
let max_streak = 0;
let current_a = null;
let current_b = null;
let answered = false;

const LIVES = 5;
let lives = LIVES;

function get_random_index(max)
{
  return Math.floor(Math.random() * max);
}

function pick_two()
{
  if (pool.length < 2) return null;

  let attempts = 0;

  while (attempts < 200) {
    attempts++;

    const i = get_random_index(pool.length);
    const j = get_random_index(pool.length);

    if (i === j) continue;
    if (used_indices.has(i) && used_indices.has(j)) continue;

    const a = pool[i];
    const b = pool[j];

    if (!a || !b) continue;
    if (a.criminal_cases === b.criminal_cases) continue;

    used_indices.add(i);
    used_indices.add(j);
    return [a, b];
  }

  used_indices.clear();

  const i = get_random_index(pool.length);
  let j = get_random_index(pool.length);
  while (j === i) {
    j = get_random_index(pool.length);
  }

  return [pool[i], pool[j]];
}

function update_score()
{
  document.getElementById('scoreCorrect').textContent = correct;
  document.getElementById('scoreTotal').textContent = total;
  document.getElementById('scoreStreak').textContent = streak;
}

function populate_card(suffix, candidate)
{
  document.getElementById('type' + suffix).textContent = candidate.type;
  document.getElementById('year' + suffix).textContent = candidate.year;
  document.getElementById('name' + suffix).textContent = candidate.name;
  document.getElementById('party' + suffix).textContent = candidate.party || '—';
  document.getElementById('const' + suffix).textContent = candidate.constituency || '—';
  document.getElementById('state' + suffix).textContent = candidate.state || '—';
  document.getElementById('crimeCount' + suffix).textContent = candidate.criminal_cases;
}

function reset_card(id)
{
  const card = document.getElementById(id);
  card.classList.remove('correct', 'wrong', 'disabled');

  const card_letter = id.slice(-1);
  document.getElementById('hidden' + card_letter).style.display = '';
  document.getElementById('revealed' + card_letter).style.display = 'none';
}

async function next_round()
{
  reset_card('cardA');
  reset_card('cardB');

  if (pool.length === 0) {
    try {
      pool = await fetch_pool(new Set(['mp', 'mla']), new Set(['2024', '2019', '2014']));
    } catch (e) {
      document.getElementById('errorMsg').textContent = 'Failed to load data. Please try again.';
      return;
    }
  }

  const pair = pick_two();
  if (!pair) return;

  current_a = pair[0];
  current_b = pair[1];
  populate_card('A', current_a);
  populate_card('B', current_b);
  answered = false;
}

function make_guess(choice)
{
  if (answered) return;
  answered = true;

  const crimes_a = current_a.criminal_cases;
  const crimes_b = current_b.criminal_cases;

  document.getElementById('hiddenA').style.display = 'none';
  document.getElementById('revealedA').style.display = 'block';
  document.getElementById('hiddenB').style.display = 'none';
  document.getElementById('revealedB').style.display = 'block';

  let correct_choice;
  if (crimes_a > crimes_b) {
    correct_choice = 'A';
  } else {
    correct_choice = 'B';
  }

  const is_correct = choice === correct_choice;

  document.getElementById('cardA').classList.add('disabled');
  document.getElementById('cardB').classList.add('disabled');

  if (is_correct) {
    document.getElementById('card' + choice).classList.add('correct');
  } else {
    document.getElementById('card' + choice).classList.add('wrong');
    document.getElementById('card' + correct_choice).classList.add('correct');
  }

  total++;

  if (is_correct) {
    correct++;
    streak++;
    if (streak > max_streak) {
      max_streak = streak;
    }
    document.getElementById('resultText').textContent = 'CORRECT';
    document.getElementById('resultSub').textContent = crimes_a + ' vs ' + crimes_b;
  } else {
    lives--;
    streak = 0;
    document.getElementById('resultText').textContent = 'WRONG — ' + lives + ' lives left';
    document.getElementById('resultSub').textContent = crimes_a + ' vs ' + crimes_b;
  }

  document.getElementById('resultBar').style.display = 'block';
  update_score();

  if (lives <= 0) {
    setTimeout(show_gameover, 1500);
  }
}

function show_gameover()
{
  document.getElementById('duelContainer').style.display = 'none';

  let pct = 0;
  if (total > 0) {
    pct = Math.round((correct / total) * 100);
  }

  document.getElementById('gameoverScore').textContent = correct + ' / ' + total + ' correct — ' + pct + '%';
  document.getElementById('gameoverScreen').style.display = 'block';
}

function restart_game()
{
  correct = 0;
  total = 0;
  streak = 0;
  max_streak = 0;
  lives = LIVES;
  pool = [];
  used_indices.clear();
  answered = false;

  document.getElementById('gameoverScreen').style.display = 'none';
  document.getElementById('duelContainer').style.display = 'block';
  document.getElementById('resultBar').style.display = 'none';

  update_score();
  next_round();
}

async function start_game()
{
  try {
    pool = await fetch_pool(new Set(['mp', 'mla']), new Set(['2024', '2019', '2014']));
  } catch (e) {
    document.getElementById('errorMsg').textContent = 'Could not reach the API: ' + e.message;
    return;
  }

  document.getElementById('duelContainer').style.display = 'block';
  next_round();
}
