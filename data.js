const API_BASE = 'https://corsproxy.io/?url=https://nish.space/my_neta';

const MP_YEARS = ['2024', '2019', '2014', '2009', '2004'];

const MLA_STATES = [
  'maharashtra', 'andhra_pradesh', 'telangana', 'karnataka', 'kerala',
  'tamil_nadu', 'gujarat', 'rajasthan', 'madhya_pradesh', 'uttar_pradesh',
  'west_bengal', 'bihar', 'odisha', 'punjab', 'haryana', 'delhi', 'goa'
];

function pick_mp_fields(mp, year)
{
  return {
    name: mp.name,
    constituency: mp.constituency,
    party: mp.party,
    criminal_cases: mp.criminal_cases,
    assets: mp.assets,
    education: mp.education,
    state: mp.state_or_ut,
    type: 'MP',
    year: year
  };
}

function pick_mla_fields(mla, state_name)
{
  return {
    name: mla.name,
    constituency: mla.constituency,
    party: mla.party,
    criminal_cases: mla.criminal_cases,
    assets: mla.assets,
    education: mla.education,
    state: state_name,
    type: 'MLA',
    year: 'Latest'
  };
}

async function fetch_pool()
{
  const all = [];

  for (let i = 0; i < MP_YEARS.length; i++) {
    const year = MP_YEARS[i];
    const response = await fetch(API_BASE + '/mps/' + year);
    const data = await response.json();
    const mps = data.mps || [];

    for (let j = 0; j < mps.length; j++) {
      all.push(pick_mp_fields(mps[j], year));
    }
  }

  for (let i = 0; i < MLA_STATES.length; i++) {
    const state = MLA_STATES[i];
    const response = await fetch(API_BASE + '/mlas/' + state);
    const data = await response.json();
    const mlas = data.mlas || [];
    const state_name = data.state || state.replace(/_/g, ' ');

    for (let j = 0; j < mlas.length; j++) {
      all.push(pick_mla_fields(mlas[j], state_name));
    }
  }

  const with_crimes = [];
  for (let i = 0; i < all.length; i++) {
    if (all[i].criminal_cases !== null && all[i].criminal_cases !== undefined) {
      with_crimes.push(all[i]);
    }
  }

  return with_crimes;
}
