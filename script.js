const inputNota1 = document.getElementById('nota1');
const inputNota2 = document.getElementById('nota2');
const inputNota3 = document.getElementById('nota3');
const btnCalcular = document.getElementById('btnCalcular');
const btnLimpar = document.getElementById('btnLimpar');
const divResultado = document.getElementById('resultado');
const valorMedia = document.getElementById('valorMedia');
const situacao = document.getElementById('situacao');

function calcularMedia() {
  const n1 = parseFloat(inputNota1.value);
  const n2 = parseFloat(inputNota2.value);
  const n3 = parseFloat(inputNota3.value);

  // Validação simples
  if (isNaN(n1) || isNaN(n2) || isNaN(n3)) {
    alert('Por favor, preencha as 3 notas com valores válidos.');
    return;
  }

  if (n1 < 0 || n1 > 10 || n2 < 0 || n2 > 10 || n3 < 0 || n3 > 10) {
    alert('As notas devem estar entre 0 e 10.');
    return;
  }

  const media = (n1 + n2 + n3) / 3;
  valorMedia.textContent = media.toFixed(1);

  // Define a situação do aluno
  if (media >= 7.0) {
    situacao.textContent = 'Situação: Aprovado(a) 🎉';
    situacao.className = 'situacao aprovado';
  } else if (media >= 5.0) {
    situacao.textContent = 'Situação: Recuperação ⚠️';
    situacao.className = 'situacao recuperacao';
  } else {
    situacao.textContent = 'Situação: Reprovado(a) ❌';
    situacao.className = 'situacao reprovado';
  }

  divResultado.classList.remove('escondido');
}

function limparCampos() {
  inputNota1.value = '';
  inputNota2.value = '';
  inputNota3.value = '';
  divResultado.classList.add('escondido');
  inputNota1.focus();
}

btnCalcular.addEventListener('click', calcularMedia);
btnLimpar.addEventListener('click', limparCampos);
