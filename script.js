const API_KEY = '5fe08bb7bde44a3689876c213ca8dff3';

const btnSearch = document.getElementById('btn-search');
const gameSearchInput = document.getElementById('game-search');
const resultContainer = document.getElementById('result-container');

btnSearch.addEventListener('click', verificarJogo);
gameSearchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') verificarJogo();
});

async function verificarJogo() {
  const nomeJogo = gameSearchInput.value.trim();
  const userRam = parseInt(document.getElementById('ram').value) || 0;
  const userVram = parseInt(document.getElementById('vram').value) || 0;

  if (!nomeJogo) return alert("Digite o nome de um jogo!");

  try {
    const response = await fetch(`https://api.rawg.io/api/games?key=${API_KEY}&search=${encodeURIComponent(nomeJogo)}`);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      alert("Jogo não encontrado!");
      return;
    }

    const jogo = data.results[0];

    const reqResponse = await fetch(`https://api.rawg.io/api/games/${jogo.id}?key=${API_KEY}`);
    const jogoDetalhes = await reqResponse.json();

    const pcPlatform = jogoDetalhes.platforms?.find(p => p.platform.id === 4);
    const reqText = pcPlatform?.requirements?.minimum || "Requisitos não informados.";

    const matchRam = reqText.match(/(\d+)\s*GB\s*RAM/i) || reqText.match(/(\d+)\s*GB/i);
    const matchVram = reqText.match(/(\d+)\s*GB\s*VRAM/i) || reqText.match(/(\d+)\s*GB\s*(vga|gpu|video|graphics)/i);

    const requiredRam = matchRam ? parseInt(matchRam[1]) : 4;
    const requiredVram = matchVram ? parseInt(matchVram[1]) : 2;

    const temRam = userRam >= requiredRam;
    const temVram = userVram >= requiredVram;
    const roda = temRam && temVram;

    document.getElementById('game-title').innerText = jogo.name;
    document.getElementById('game-image').src = jogo.background_image || '';
    document.getElementById('game-requirements').innerText = reqText;

    const badge = document.getElementById('status-badge');
    if (roda) {
      badge.innerText = "🟢 RODA NO SEU PC";
      badge.className = "badge success";
    } else {
      badge.innerText = `🔴 NÃO RODA (Exige ${requiredRam}GB RAM / ${requiredVram}GB VRAM)`;
      badge.className = "badge danger";
    }

    resultContainer.classList.remove('hidden');

  } catch (error) {
    console.error("Erro:", error);
    alert("Erro ao conectar com a API do RAWG.");
  }
}