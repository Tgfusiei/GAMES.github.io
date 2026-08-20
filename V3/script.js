const API_KEY = '5fe08bb7bde44a3689876c213ca8dff3';

const gamesFeed = document.getElementById('games-feed');
const btnSearch = document.getElementById('btn-search');
const gameSearchInput = document.getElementById('game-search');
const ramInput = document.getElementById('ram');

// Carrega os jogos iniciais ao abrir a página
window.addEventListener('DOMContentLoaded', () => {
  carregarJogos();
});

// Atualiza a checagem se o usuário mudar a RAM
ramInput.addEventListener('change', () => {
  const termo = gameSearchInput.value.trim();
  carregarJogos(termo);
});

// Eventos de busca
btnSearch.addEventListener('click', () => {
  carregarJogos(gameSearchInput.value.trim());
});

gameSearchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    carregarJogos(gameSearchInput.value.trim());
  }
});

async function carregarJogos(termoBusca = '') {
  gamesFeed.innerHTML = '<p class="loading">Buscando jogos...</p>';
  
  try {
    const url = termoBusca 
      ? `https://api.rawg.io/api/games?key=${API_KEY}&search=${encodeURIComponent(termoBusca)}&page_size=8`
      : `https://api.rawg.io/api/games?key=${API_KEY}&page_size=8`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      gamesFeed.innerHTML = '<p class="loading">Nenhum jogo encontrado.</p>';
      return;
    }

    gamesFeed.innerHTML = '';

    // Processa cada jogo retornado
    for (const jogo of data.results) {
      const card = await criarCardJogo(jogo);
      gamesFeed.appendChild(card);
    }

  } catch (error) {
    console.error("Erro ao carregar feed:", error);
    gamesFeed.innerHTML = '<p class="loading">Erro ao carregar a lista de jogos.</p>';
  }
}

async function criarCardJogo(jogo) {
  const card = document.createElement('div');
  card.className = 'game-card';

  // Busca detalhes para requisitos do PC
  let reqText = "Não informado";
  let requiredRam = 4;

  try {
    const reqResponse = await fetch(`https://api.rawg.io/api/games/${jogo.id}?key=${API_KEY}`);
    const detalhes = await reqResponse.json();
    const pcPlatform = detalhes.platforms?.find(p => p.platform.id === 4);
    
    if (pcPlatform?.requirements?.minimum) {
      reqText = pcPlatform.requirements.minimum;
      const matchRam = reqText.match(/(\d+)\s*GB\s*RAM/i) || reqText.match(/(\d+)\s*GB/i);
      if (matchRam) requiredRam = parseInt(matchRam[1]);
    }
  } catch (e) {
    console.error("Erro ao obter detalhes:", e);
  }

  const userRam = parseInt(ramInput.value) || 0;
  const roda = userRam >= requiredRam;

  const statusClass = roda ? 'run' : 'no-run';
  const statusTexto = roda ? '🟢 RODA' : `🔴 exige ${requiredRam}GB`;

  const imagemUrl = jogo.background_image || 'https://via.placeholder.com/70x45?text=Sem+Foto';

  card.innerHTML = `
    <img src="${imagemUrl}" alt="${jogo.name}">
    <div class="game-info">
      <h3>${jogo.name}</h3>
      <p>Requisito estimado: ${requiredRam} GB RAM</p>
    </div>
    <span class="status-tag ${statusClass}">${statusTexto}</span>
  `;

  return card;
}