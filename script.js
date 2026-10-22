/**
 * Calculadora de Médias Pro
 * Suporta média aritmética simples e ponderada, escalas 0-10 ou 0-100,
 * metas personalizadas e persistência local.
 */

// Estado da Aplicação
const state = {
  mode: 'simples', // 'simples' ou 'ponderada'
  passingGrade: 7.0,
  recoveryGrade: 5.0,
  maxGrade: 10,
  theme: 'light',
  grades: [
    { id: 1, name: 'Avaliação 1', value: 8.5, weight: 2 },
    { id: 2, name: 'Avaliação 2', value: 6.0, weight: 3 },
    { id: 3, name: 'Trabalho em Equipe', value: 9.0, weight: 1 }
  ]
};

// Elementos DOM
const gradesList = document.getElementById('gradesList');
const btnAddGrade = document.getElementById('btnAddGrade');
const btnClear = document.getElementById('btnClear');
const btnExample = document.getElementById('btnExample');
const btnCopyReport = document.getElementById('btnCopyReport');
const calcModeSelect = document.getElementById('calcMode');
const passingGradeInput = document.getElementById('passingGrade');
const recoveryGradeInput = document.getElementById('recoveryGrade');
const maxGradeSelect = document.getElementById('maxGrade');
const colWeightHeader = document.getElementById('colWeightHeader');
const tableHeader = document.getElementById('tableHeader');

// Elementos de Exibição de Resultados
const finalAverageEl = document.getElementById('finalAverage');
const scoreCircle = document.getElementById('scoreCircle');
const statusBadge = document.getElementById('statusBadge');
const statusMessage = document.getElementById('statusMessage');
const progressBar = document.getElementById('progressBar');
const targetMarker = document.getElementById('targetMarker');
const targetLabel = document.getElementById('targetLabel');
const maxLabel = document.getElementById('maxLabel');
const statHighest = document.getElementById('statHighest');
const statLowest = document.getElementById('statLowest');
const statCount = document.getElementById('statCount');
const statDiff = document.getElementById('statDiff');
const statDiffLabel = document.getElementById('statDiffLabel');

// Tema
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const toast = document.getElementById('toast');

// Inicialização
function init() {
  loadFromLocalStorage();
  setupEventListeners();
  applyTheme(state.theme);
  updateUIConfig();
  renderGrades();
  calculateResults();
}

// Configurar Event Listeners
function setupEventListeners() {
  btnAddGrade.addEventListener('click', () => {
    addGradeRow();
  });

  btnClear.addEventListener('click', () => {
    state.grades = [];
    renderGrades();
    calculateResults();
    saveToLocalStorage();
    showToast('Todas as notas foram removidas.');
  });

  btnExample.addEventListener('click', () => {
    state.grades = [
      { id: Date.now() + 1, name: 'Prova Teórica 1', value: state.maxGrade === 10 ? 8.0 : 80, weight: 2 },
      { id: Date.now() + 2, name: 'Prova Teórica 2', value: state.maxGrade === 10 ? 6.5 : 65, weight: 3 },
      { id: Date.now() + 3, name: 'Projeto Prático', value: state.maxGrade === 10 ? 9.5 : 95, weight: 4 },
      { id: Date.now() + 4, name: 'Participação', value: state.maxGrade === 10 ? 7.0 : 70, weight: 1 }
    ];
    renderGrades();
    calculateResults();
    saveToLocalStorage();
    showToast('Exemplo carregado!');
  });

  calcModeSelect.addEventListener('change', (e) => {
    state.mode = e.target.value;
    updateTableColumns();
    renderGrades();
    calculateResults();
    saveToLocalStorage();
  });

  passingGradeInput.addEventListener('input', (e) => {
    state.passingGrade = parseFloat(e.target.value) || 0;
    calculateResults();
    saveToLocalStorage();
  });

  recoveryGradeInput.addEventListener('input', (e) => {
    state.recoveryGrade = parseFloat(e.target.value) || 0;
    calculateResults();
    saveToLocalStorage();
  });

  maxGradeSelect.addEventListener('change', (e) => {
    const oldMax = state.maxGrade;
    const newMax = parseInt(e.target.value, 10);
    state.maxGrade = newMax;

    // Ajusta proporcionalmente valores configurados se mudar de 10 para 100 ou vice-versa
    const factor = newMax / oldMax;
    state.passingGrade = parseFloat((state.passingGrade * factor).toFixed(1));
    state.recoveryGrade = parseFloat((state.recoveryGrade * factor).toFixed(1));
    passingGradeInput.value = state.passingGrade;
    recoveryGradeInput.value = state.recoveryGrade;

    state.grades = state.grades.map(g => ({
      ...g,
      value: g.value !== null ? parseFloat((g.value * factor).toFixed(1)) : null
    }));

    updateUIConfig();
    renderGrades();
    calculateResults();
    saveToLocalStorage();
  });

  themeToggle.addEventListener('click', () => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
    saveToLocalStorage();
  });

  btnCopyReport.addEventListener('click', copySummaryToClipboard);
}

// Atualizar Tema
function applyTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// Atualizar UI de Configurações
function updateUIConfig() {
  calcModeSelect.value = state.mode;
  passingGradeInput.value = state.passingGrade;
  recoveryGradeInput.value = state.recoveryGrade;
  maxGradeSelect.value = state.maxGrade;
  maxLabel.textContent = state.maxGrade.toFixed(1);
  targetLabel.textContent = `Meta: ${state.passingGrade.toFixed(1)}`;

  const maxVal = state.maxGrade;
  passingGradeInput.max = maxVal;
  recoveryGradeInput.max = maxVal;

  updateTableColumns();
}

function updateTableColumns() {
  const isPonderada = state.mode === 'ponderada';
  if (isPonderada) {
    colWeightHeader.style.display = 'block';
    tableHeader.classList.remove('weight-hidden');
  } else {
    colWeightHeader.style.display = 'none';
    tableHeader.classList.add('weight-hidden');
  }
}

// Renderizar Linhas de Notas
function renderGrades() {
  gradesList.innerHTML = '';
  const isPonderada = state.mode === 'ponderada';

  if (state.grades.length === 0) {
    gradesList.innerHTML = `
      <div style="text-align: center; padding: 24px; color: var(--text-secondary); font-size: 0.95rem;">
        Nenhuma avaliação adicionada. Clique abaixo para começar! 👇
      </div>
    `;
    return;
  }

  state.grades.forEach((grade, index) => {
    const row = document.createElement('div');
    row.className = `grade-row ${isPonderada ? '' : 'weight-hidden'}`;
    row.dataset.id = grade.id;

    row.innerHTML = `
      <input type="text" class="input-name" placeholder="Ex: Prova ${index + 1}" value="${escapeHtml(grade.name)}">
      <input type="number" class="input-grade" placeholder="0 - ${state.maxGrade}" min="0" max="${state.maxGrade}" step="0.1" value="${grade.value !== null && !isNaN(grade.value) ? grade.value : ''}">
      ${isPonderada ? `<input type="number" class="input-weight" placeholder="Peso" min="0.1" step="0.5" value="${grade.weight || 1}">` : ''}
      <button class="btn-remove" title="Remover avaliação">✕</button>
    `;

    // Eventos nos inputs
    const inputName = row.querySelector('.input-name');
    const inputGrade = row.querySelector('.input-grade');
    const inputWeight = row.querySelector('.input-weight');
    const btnRemove = row.querySelector('.btn-remove');

    inputName.addEventListener('input', (e) => {
      grade.name = e.target.value;
      saveToLocalStorage();
    });

    inputGrade.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      grade.value = isNaN(val) ? null : val;
      calculateResults();
      saveToLocalStorage();
    });

    if (inputWeight) {
      inputWeight.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        grade.weight = isNaN(val) || val <= 0 ? 1 : val;
        calculateResults();
        saveToLocalStorage();
      });
    }

    btnRemove.addEventListener('click', () => {
      removeGrade(grade.id);
    });

    gradesList.appendChild(row);
  });
}

function addGradeRow() {
  const newGrade = {
    id: Date.now(),
    name: `Avaliação ${state.grades.length + 1}`,
    value: null,
    weight: 1
  };
  state.grades.push(newGrade);
  renderGrades();
  calculateResults();
  saveToLocalStorage();

  // Foco no input da nova linha
  const rows = gradesList.querySelectorAll('.grade-row');
  if (rows.length > 0) {
    const lastRowInput = rows[rows.length - 1].querySelector('.input-grade');
    if (lastRowInput) lastRowInput.focus();
  }
}

function removeGrade(id) {
  state.grades = state.grades.filter(g => g.id !== id);
  renderGrades();
  calculateResults();
  saveToLocalStorage();
}

// Cálculo das Médias
function calculateResults() {
  const validGrades = state.grades.filter(g => g.value !== null && !isNaN(g.value) && g.value >= 0);

  targetLabel.textContent = `Meta: ${state.passingGrade.toFixed(1)}`;
  const markerPos = Math.min(100, Math.max(0, (state.passingGrade / state.maxGrade) * 100));
  targetMarker.style.left = `${markerPos}%`;

  if (validGrades.length === 0) {
    finalAverageEl.textContent = '--';
    statusBadge.className = 'status-badge status-pending';
    statusBadge.textContent = 'Aguardando notas';
    statusMessage.textContent = 'Adicione ao menos uma nota válida para obter o cálculo.';
    progressBar.style.width = '0%';
    scoreCircle.style.borderColor = 'var(--primary)';
    scoreCircle.style.boxShadow = '0 0 20px var(--primary-shadow)';

    statHighest.textContent = '--';
    statLowest.textContent = '--';
    statCount.textContent = '0';
    statDiff.textContent = '--';
    statDiffLabel.textContent = 'Diferença p/ Aprovação';
    return;
  }

  let finalAverage = 0;
  const values = validGrades.map(g => g.value);

  if (state.mode === 'ponderada') {
    let totalWeight = 0;
    let weightedSum = 0;

    validGrades.forEach(g => {
      const w = g.weight && g.weight > 0 ? g.weight : 1;
      weightedSum += g.value * w;
      totalWeight += w;
    });

    finalAverage = totalWeight > 0 ? weightedSum / totalWeight : 0;
  } else {
    const sum = values.reduce((acc, curr) => acc + curr, 0);
    finalAverage = sum / validGrades.length;
  }

  // Atualizar visual da média
  const averageFormatted = finalAverage.toFixed(2);
  finalAverageEl.textContent = averageFormatted;

  // Barra de progresso
  const percent = Math.min(100, Math.max(0, (finalAverage / state.maxGrade) * 100));
  progressBar.style.width = `${percent}%`;

  // Status & Cores
  const diff = finalAverage - state.passingGrade;

  if (finalAverage >= state.passingGrade) {
    statusBadge.className = 'status-badge status-approved';
    statusBadge.textContent = 'Aprovado(a) 🎉';
    statusMessage.textContent = `Parabéns! Sua média está ${Math.abs(diff).toFixed(2)} acima da nota de corte.`;
    scoreCircle.style.borderColor = 'var(--success)';
    scoreCircle.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.35)';
    progressBar.style.background = 'var(--success)';

    statDiffLabel.textContent = 'Margem de Segurança';
    statDiff.textContent = `+${Math.abs(diff).toFixed(2)}`;
    statDiff.style.color = 'var(--success)';
  } else if (finalAverage >= state.recoveryGrade) {
    statusBadge.className = 'status-badge status-recovery';
    statusBadge.textContent = 'Recuperação ⚠️';
    statusMessage.textContent = `Atenção! Você precisa de +${Math.abs(diff).toFixed(2)} pontos para alcançar a aprovação direta.`;
    scoreCircle.style.borderColor = 'var(--warning)';
    scoreCircle.style.boxShadow = '0 0 20px rgba(245, 158, 11, 0.35)';
    progressBar.style.background = 'var(--warning)';

    statDiffLabel.textContent = 'Faltam para Aprovação';
    statDiff.textContent = `-${Math.abs(diff).toFixed(2)}`;
    statDiff.style.color = 'var(--warning)';
  } else {
    statusBadge.className = 'status-badge status-failed';
    statusBadge.textContent = 'Reprovado(a) ❌';
    statusMessage.textContent = `Média insuficiente. Faltaram ${Math.abs(diff).toFixed(2)} pontos para aprovação.`;
    scoreCircle.style.borderColor = 'var(--danger)';
    scoreCircle.style.boxShadow = '0 0 20px rgba(239, 68, 68, 0.35)';
    progressBar.style.background = 'var(--danger)';

    statDiffLabel.textContent = 'Faltam para Aprovação';
    statDiff.textContent = `-${Math.abs(diff).toFixed(2)}`;
    statDiff.style.color = 'var(--danger)';
  }

  // Estatísticas
  statHighest.textContent = Math.max(...values).toFixed(1);
  statLowest.textContent = Math.min(...values).toFixed(1);
  statCount.textContent = validGrades.length.toString();
}

// Copiar resumo
function copySummaryToClipboard() {
  const validGrades = state.grades.filter(g => g.value !== null && !isNaN(g.value));
  if (validGrades.length === 0) {
    showToast('Nenhuma nota para exportar!');
    return;
  }

  const avg = finalAverageEl.textContent;
  const status = statusBadge.textContent;
  const modeStr = state.mode === 'ponderada' ? 'Média Ponderada' : 'Média Aritmética';

  let report = `📊 Relatório de Notas - Calculadora de Médias\n`;
  report += `--------------------------------------\n`;
  report += `Modalidade: ${modeStr}\n`;
  report += `Meta de Aprovação: ${state.passingGrade}\n`;
  report += `Média Final: ${avg} / ${state.maxGrade}\n`;
  report += `Situação: ${status}\n\n`;
  report += `Notas Cadastradas:\n`;

  state.grades.forEach(g => {
    if (g.value !== null) {
      const weightInfo = state.mode === 'ponderada' ? ` (Peso ${g.weight})` : '';
      report += `- ${g.name || 'Avaliação'}: ${g.value}${weightInfo}\n`;
    }
  });

  navigator.clipboard.writeText(report).then(() => {
    showToast('Resumo copiado para a área de transferência! 📋');
  }).catch(() => {
    showToast('Erro ao copiar resumo.');
  });
}

// Toast
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// LocalStorage
function saveToLocalStorage() {
  try {
    localStorage.setItem('calculadora_medias_state', JSON.stringify(state));
  } catch (e) {
    console.error('Falha ao salvar no localStorage', e);
  }
}

function loadFromLocalStorage() {
  try {
    const saved = localStorage.getItem('calculadora_medias_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      Object.assign(state, parsed);
    }
  } catch (e) {
    console.error('Falha ao ler do localStorage', e);
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, function (m) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m];
  });
}

// Inicializa no carregamento do DOM
document.addEventListener('DOMContentLoaded', init);
