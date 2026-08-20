// Chave de API configurada
const API_KEY = '5fe08bb7bde44a3689876c213ca8dff3'; 

const btnSearch = document.getElementById('btn-search');
const gameSearchInput = document.getElementById('game-search');
const resultContainer = document.getElementById('result-container');

btnSearch.addEventListener('click', () => {
  const nomeJogo = gameSearchInput.value.trim();
  if (nomeJogo) {
    verificarJogo(nomeJogo);
  } else {
    alert("Digite o nome de um jogo!");
  }
});

async function verificarJogo(nomeJogo) {
  try {
    // 1. Busca o jogo na API do RAWG
    const response = await fetch(`https://api.rawg.io/api/games?key=${API_KEY}&search=${encodeURIComponent(nomeJogo)}`);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      alert("Jogo não encontrado!");
      return;
    }

    const jogo = data.results[0];

    // 2. Busca detalhes para pegar os requisitos completos de PC
    const reqResponse = await fetch(`https://api.rawg.io/api/games/${jogo.id}?key=${API_KEY}`);
    const jogoDetalhes = await reqResponse.json();

    // 3. Pega a plataforma PC (id = 4)
    const pcPlatform = jogoDetalhes.platforms?.find(p => p.platform.id === 4);
    const reqText = pcPlatform?.requirements?.minimum || "Requisitos mínimos não informados para este jogo.";

    // 4. Preenche as informações na tela
    document.getElementById('game-title').innerText = jogo.name;
    document.getElementById('game-image').src = jogo.background_image || '';
    document.getElementById('game-requirements').innerText = reqText;

    // 5. Algoritmo simples de extração de RAM do texto de requisitos
    const userRam = parseInt(document.getElementById('ram').value) || 0;
    const matchRam = reqText.match(/(\d+)\s*GB\s*RAM/i) || reqText.match(/(\d+)\s*GB/i);
    const requiredRam = matchRam ? parseInt(matchRam[1]) : 4; // Assume 4GB caso o texto não especifique um número

    const badge = document.getElementById('status-badge');
    if (userRam >= requiredRam) {
      badge.innerText = "🟢 RODA NO SEU PC";
      badge.className = "badge success";
    } else {
      badge.innerText = `🔴 NÃO RODA (Exige no mínimo ${requiredRam}GB de RAM)`;
      badge.className = "badge danger";
    }

    resultContainer.classList.remove('hidden');

  } catch (error) {
    console.error("Erro ao buscar jogo:", error);
    alert("Erro ao conectar com a API do RAWG.");
  }
}