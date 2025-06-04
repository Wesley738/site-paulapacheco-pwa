// Dados salvos (mantendo suas variáveis existentes)
let metas = JSON.parse(localStorage.getItem('metas')) || [];
let tarefasChecklist = JSON.parse(localStorage.getItem('checklist')) || [
  { id: 1, texto: "Meditar por 10 minutos", concluida: false },
  { id: 2, texto: "Beber 2L de água", concluida: false }
];

// Garante que âncoras não fiquem atrás da barra
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    window.scrollTo({
      top: target.offsetTop - 60, // 60px = altura da barra
      behavior: 'smooth'
    });
  });
});

// Navegação entre seções
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', function(e) {
    e.preventDefault();
    
    // 1️⃣ Remove classe ativa de todos os itens
    document.querySelectorAll('.nav-item').forEach(nav => {
      nav.classList.remove('ativo');
    });
    
    // 2️⃣ Ativa o item clicado
    this.classList.add('ativo');
    
    // 3️⃣ Esconde todas as seções
    document.querySelectorAll('section').forEach(sec => {
      sec.style.display = 'none';
    });
    
    // 4️⃣ Mostra a seção alvo
    const target = this.getAttribute('href');
    const secaoAlvo = document.querySelector(target);
    if (secaoAlvo) {
      secaoAlvo.style.display = 'block';
    }
    
    // 5️⃣ Scroll suave
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
});

// Evento ESPECÍFICO para a reflexão (se precisar de tratamento especial)
document.querySelector('[href="#reflexao"]').addEventListener('click', function(e) {
  e.preventDefault();
  
  // Ativa navbar
  document.querySelectorAll('.nav-item').forEach(nav => {
    nav.classList.remove('ativo');
  });
  this.classList.add('ativo');
  
  // Esconde outras seções
  document.querySelectorAll('section').forEach(sec => {
    sec.style.display = 'none';
  });
  
  // Mostra reflexão
  document.getElementById('reflexao').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Ativa a primeira aba por padrão
document.querySelector('.nav-item').click();

// Função para limpar concluídas
document.getElementById('limpar-concluidas').addEventListener('click', () => {
  if (confirm('Tem certeza que quer apagar todas as metas concluídas?')) {
    metas = metas.filter(meta => !meta.concluida);
    localStorage.setItem('metas', JSON.stringify(metas));
    renderizarMetas();
  }
});

// Configura o botão "+"
document.getElementById('btn-adicionar').addEventListener('click', function() {
  const inputMeta = document.getElementById('nova-meta');
  const textoMeta = inputMeta.value.trim();
  const pilar = document.getElementById('pilar').value;
  const periodo = document.getElementById('periodo').value;

  if (!textoMeta) {
    alert("⚠️ Digite uma meta válida!");
    return;
  }

  // Adiciona a meta com o período
  metas.push({ 
    id: Date.now(), // Usando timestamp como ID único
    texto: textoMeta, 
    pilar: pilar,
    periodo: periodo,
    concluida: false 
  });

  // Salva e atualiza
  salvarMetas();
  inputMeta.value = '';
  renderizarMetas();
});

// Função para renderizar metas (atualizada)
function renderizarMetas() {
  // Limpa todos os containers de metas primeiro
  document.querySelectorAll('.lista-metas').forEach(container => {
    container.innerHTML = '';
  });

  if (metas.length === 0) {
    document.querySelectorAll('.lista-metas').forEach(container => {
      container.innerHTML = '<p class="sem-metas">Nenhuma meta adicionada ainda.</p>';
    });
    return;
  }

  // Organiza metas por período
  const metasPorPeriodo = {
    semanal: metas.filter(m => m.periodo === 'semanal'),
    mensal: metas.filter(m => m.periodo === 'mensal'),
    trimestral: metas.filter(m => m.periodo === 'trimestral'),
    anual: metas.filter(m => m.periodo === 'anual')
  };

  // Renderiza cada período
  for (const periodo in metasPorPeriodo) {
    const containerPeriodo = document.querySelector(`.lista-metas[data-periodo="${periodo}"]`);
    
    // Agrupa por pilar dentro de cada período
    const pilares = {
      'saude-fisica': { titulo: '💪 Saúde Física', metas: [] },
      'saude-espiritual': { titulo: '🧘 Saúde Espiritual', metas: [] },
      'estudos': { titulo: '📚 Estudos', metas: [] },
      'familia': { titulo: '👨‍👩‍👧‍👦 Relacionamentos', metas: [] },
      'trabalho': { titulo: '💼 Trabalho', metas: [] }
    };

    metasPorPeriodo[periodo].forEach(meta => {
      pilares[meta.pilar].metas.push(meta);
    });

    // Renderiza cada pilar dentro do período
    for (const pilar in pilares) {
      if (pilares[pilar].metas.length > 0) {
        const containerPilar = document.createElement('div');
        containerPilar.className = 'pilar-container';

        const tituloPilar = document.createElement('div');
        tituloPilar.className = 'pilar-titulo';
        tituloPilar.textContent = pilares[pilar].titulo;
        containerPilar.appendChild(tituloPilar);

        pilares[pilar].metas.forEach(meta => {
          const itemMeta = document.createElement('div');
          itemMeta.className = `meta-item ${meta.concluida ? 'concluida' : ''}`;
          itemMeta.dataset.id = meta.id;

          // Checkbox
          const checkboxContainer = document.createElement('label');
          checkboxContainer.className = 'checkbox-container';
          
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.checked = meta.concluida;
          checkbox.addEventListener('change', () => toggleConcluirMeta(meta.id));
          
          const checkmark = document.createElement('span');
          checkmark.className = 'checkmark';
          
          checkboxContainer.appendChild(checkbox);
          checkboxContainer.appendChild(checkmark);
          itemMeta.appendChild(checkboxContainer);

          // Texto da Meta
          const textoMeta = document.createElement('span');
          textoMeta.className = 'texto-meta';
          textoMeta.textContent = meta.texto;
          itemMeta.appendChild(textoMeta);

          // Botões de Ação
          const acoes = document.createElement('div');
          acoes.className = 'acoes-meta';
          
          const btnEditar = document.createElement('button');
          btnEditar.className = 'btn-editar';
          btnEditar.innerHTML = '✏️';
          btnEditar.addEventListener('click', (e) => {
            e.stopPropagation();
            editarMeta(meta.id);
          });
          
          const btnDeletar = document.createElement('button');
          btnDeletar.className = 'btn-deletar';
          btnDeletar.innerHTML = '🗑️';
          btnDeletar.addEventListener('click', (e) => {
            e.stopPropagation();
            removerMeta(meta.id);
          });
          
          acoes.appendChild(btnEditar);
          acoes.appendChild(btnDeletar);
          itemMeta.appendChild(acoes);

          containerPilar.appendChild(itemMeta);
        });

        containerPeriodo.appendChild(containerPilar);
      }
    }
  }

  // Atualiza botão de limpar concluídas
  const totalConcluidas = metas.filter(m => m.concluida).length;
  const btnLimpar = document.getElementById('limpar-concluidas');
  
  if (totalConcluidas > 0) {
    btnLimpar.style.display = 'flex';
    btnLimpar.innerHTML = `🗑️ Limpar Todas Concluídas (${totalConcluidas})`;
  } else {
    btnLimpar.style.display = 'none';
  }
}


// 3. Atualize as funções auxiliares para trabalhar com IDs em vez de índices
function toggleConcluirMeta(id) {
  const metaIndex = metas.findIndex(m => m.id === id);
  if (metaIndex !== -1) {
    metas[metaIndex].concluida = !metas[metaIndex].concluida;
    salvarMetas();
    renderizarMetas();
  }
}

function editarMeta(id) {
  const meta = metas.find(m => m.id === id);
  if (!meta) return;

  const novoTexto = prompt("Editar meta:", meta.texto);
  if (novoTexto !== null && novoTexto.trim() !== "") {
    meta.texto = novoTexto.trim();
    salvarMetas();
    renderizarMetas();
  }
}

function removerMeta(id) {
  if (confirm('Tem certeza que deseja remover esta meta?')) {
    metas = metas.filter(m => m.id !== id);
    salvarMetas();
    renderizarMetas();
  }
}

function limparConcluidas() {
  if (confirm('Tem certeza que quer apagar todas as metas concluídas?')) {
    metas = metas.filter(meta => !meta.concluida);
    salvarMetas();
    renderizarMetas();
  }
}

function salvarMetas() {
  localStorage.setItem('metas', JSON.stringify(metas));
}

document.querySelectorAll('.prioridade-item').forEach(item => {
  const input = item.querySelector('.input-prioridade');
  const btnConcluir = item.querySelector('.btn-concluir');
  const btnEditar = item.querySelector('.btn-editar');

  // Concluir prioridade
  btnConcluir.addEventListener('click', () => {
    input.classList.add('bloqueado');
    btnConcluir.style.display = 'none';
    btnEditar.style.display = 'block';
    // Salva estado no localStorage
    salvarPrioridades();
  });

  // Editar prioridade
  btnEditar.addEventListener('click', () => {
    input.classList.remove('bloqueado');
    btnEditar.style.display = 'none';
    btnConcluir.style.display = 'block';
    input.focus();
  });
});

function salvarPrioridades() {
  const prioridades = [];
  
  // 1️⃣ Pega TODOS os itens de prioridade
  document.querySelectorAll('.prioridade-item').forEach(item => {
    const input = item.querySelector('.input-prioridade');
    
    // 2️⃣ Monta o objeto com dados atualizados
    prioridades.push({
      id: input.id,  // Ex: "prioridade-1"
      texto: input.value,
      concluida: input.classList.contains('bloqueado') // true/false
    });
  });

  // 3️⃣ Salva no localStorage (sobrescreve tudo)
  localStorage.setItem('prioridades', JSON.stringify(prioridades));
}

function carregarPrioridades() {
  const prioridadesSalvas = JSON.parse(localStorage.getItem('prioridades')) || [];
  
  prioridadesSalvas.forEach(prioridade => {
    const input = document.getElementById(prioridade.id);
    if (!input) return;
    
    input.value = prioridade.texto;
    
    if (prioridade.concluida) {
      input.classList.add('bloqueado');
      input.closest('.prioridade-item').querySelector('.btn-concluir').style.display = 'none';
      input.closest('.prioridade-item').querySelector('.btn-editar').style.display = 'block';
    }
  });
}

window.addEventListener('load', carregarPrioridades);

function renderizarChecklist() {
  const lista = document.getElementById('lista-tarefas');
  lista.innerHTML = '';

  tarefasChecklist.forEach(tarefa => {
    const li = document.createElement('li');
    li.className = `tarefa-item ${tarefa.concluida ? 'concluida' : ''}`;
    
    li.innerHTML = `
      <label class="checkbox-container">
        <input 
          type="checkbox" 
          class="tarefa-checkbox" 
          ${tarefa.concluida ? 'checked' : ''}
          data-id="${tarefa.id}"
        >
        <span class="checkmark"></span>
      </label>
      <span class="tarefa-texto">${tarefa.texto}</span>
      <div class="tarefa-acoes">
        <button class="btn-editar-tarefa" data-id="${tarefa.id}">✏️</button>
        <button class="btn-excluir-tarefa" data-id="${tarefa.id}">🗑️</button>
      </div>
    `;
    
    lista.appendChild(li);
  });

  // Atualiza eventos
  atualizarEventosChecklist();
}

function atualizarEventosChecklist() {
  // Checkbox - Concluir
  document.querySelectorAll('.tarefa-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      const id = parseInt(this.dataset.id);
      const tarefa = tarefasChecklist.find(t => t.id === id);
      tarefa.concluida = this.checked;
      salvarChecklist();
      renderizarChecklist();
    });
  });

  // Editar
  document.querySelectorAll('.btn-editar-tarefa').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = parseInt(this.dataset.id);
      const tarefa = tarefasChecklist.find(t => t.id === id);
      const novoTexto = prompt("Editar tarefa:", tarefa.texto);
      
      if (novoTexto && novoTexto.trim() !== '') {
        tarefa.texto = novoTexto.trim();
        salvarChecklist();
        renderizarChecklist();
      }
    });
  });

  // Excluir
  document.querySelectorAll('.btn-excluir-tarefa').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = parseInt(this.dataset.id);
      if (confirm('Tem certeza que quer excluir esta tarefa?')) {
        tarefasChecklist = tarefasChecklist.filter(t => t.id !== id);
        salvarChecklist();
        renderizarChecklist();
      }
    });
  });
}

// Adicionar Nova Tarefa
document.getElementById('btn-add-tarefa').addEventListener('click', () => {
  const texto = prompt("Nova tarefa:");
  if (texto && texto.trim() !== '') {
    tarefasChecklist.push({
      id: Date.now(),
      texto: texto.trim(),
      concluida: false
    });
    salvarChecklist();
    renderizarChecklist();
  }
});

// Limpar Concluídas
document.getElementById('btn-limpar-concluidas').addEventListener('click', () => {
  if (confirm('Limpar todas as tarefas concluídas?')) {
    tarefasChecklist = tarefasChecklist.filter(t => !t.concluida);
    salvarChecklist();
    renderizarChecklist();
  }
});

// Salvar no LocalStorage
function salvarChecklist() {
  localStorage.setItem('checklist', JSON.stringify(tarefasChecklist));
}

// Inicialização
window.addEventListener('load', () => {
  renderizarChecklist();
});

// Inicializa
renderizarMetas();

document.querySelectorAll('.diagnostico-caixa').forEach(caixa => {
  const textarea = caixa.querySelector('textarea');
  const btnEditar = caixa.querySelector('.btn-editar-diagnostico');
  const btnConcluir = caixa.querySelector('.btn-concluir-diagnostico');

  // Estado Inicial: Edição habilitada
  textarea.removeAttribute('readonly');

  // Concluir (bloqueia edição)
  btnConcluir.addEventListener('click', () => {
    textarea.setAttribute('readonly', true);
    btnConcluir.style.display = 'none';
    btnEditar.style.display = 'block';
    localStorage.setItem(textarea.id, textarea.value);
  });

  // Editar (reabilita edição)
  btnEditar.addEventListener('click', () => {
    textarea.removeAttribute('readonly');
    textarea.focus();
    btnEditar.style.display = 'none';
    btnConcluir.style.display = 'block';
  });

  // Carrega dados salvos
  const salvo = localStorage.getItem(textarea.id);
  if (salvo) textarea.value = salvo;
});

// Função para criar um relatório HTML
function criarRelatorio(diagnostico) {
  return `
    <div class="relatorio" data-timestamp="${diagnostico.timestamp}">
      <h3 class="relatorio-titulo">Diagnóstico - ${diagnostico.data}</h3>
      <div class="relatorio-item">
        <h4>🙏 Agradecimentos:</h4>
        <p>${diagnostico.agradecimentos || "Nenhum registro"}</p>
      </div>
      <div class="relatorio-item">
        <h4>🔍 Preciso Melhorar:</h4>
        <p>${diagnostico.melhorias || "Nenhum registro"}</p>
      </div>
    </div>
  `;
}

// Função para renderizar TODOS os relatórios (do mais novo pro mais antigo)
function renderizarRelatorios() {
  const container = document.getElementById('container-relatorios');
  const historico = JSON.parse(localStorage.getItem('historicoDiagnosticos')) || [];
  
  container.innerHTML = '';
  
  // Ordena do mais recente pro mais antigo
  historico.sort((a, b) => b.timestamp - a.timestamp).forEach(diagnostico => {
    container.innerHTML += criarRelatorio(diagnostico);
  });
}

// Função para adicionar novo diagnóstico
document.getElementById('btn-finalizar-diagnostico').addEventListener('click', () => {
  if (!confirm('Finalizar diagnóstico e gerar relatório?')) return;

  const novoDiagnostico = {
    data: new Date().toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    agradecimentos: document.getElementById('agradecimentos').value,
    melhorias: document.getElementById('melhorias').value,
    timestamp: Date.now()
  };

  // Atualiza histórico
  const historico = JSON.parse(localStorage.getItem('historicoDiagnosticos')) || [];
  historico.push(novoDiagnostico);
  localStorage.setItem('historicoDiagnosticos', JSON.stringify(historico));

  // Limpa campos e renderiza
  document.getElementById('agradecimentos').value = '';
  document.getElementById('melhorias').value = '';
  renderizarRelatorios();
});

// Botão Nuclear (limpar TUDO)
document.getElementById('btn-nuclear').addEventListener('click', () => {
  if (confirm('💣 ATENÇÃO! Isso apagará TODOS os diagnósticos. Continuar?')) {
    localStorage.removeItem('historicoDiagnosticos');
    document.getElementById('container-relatorios').innerHTML = '';
    alert('Todos os diagnósticos foram removidos!');
  }
});

// Carrega ao iniciar
window.addEventListener('load', renderizarRelatorios);

// Seção Leitura - Variáveis
let livros = JSON.parse(localStorage.getItem('livros')) || [];

// Elementos da seção Leitura
const tituloLivroInput = document.getElementById('titulo-livro');
const dataInicioInput = document.getElementById('data-inicio');
const dataMetaInput = document.getElementById('data-meta');
const btnAdicionarLivro = document.getElementById('btn-adicionar-livro');
const listaDeLivros = document.getElementById('lista-livros');
const modalConclusao = document.getElementById('modal-conclusao');
const modalTituloLivro = document.getElementById('modal-titulo-livro');
const dataConclusaoInput = document.getElementById('data-conclusao');
const btnConfirmarConclusao = document.getElementById('btn-confirmar-conclusao');
const btnCancelarConclusao = document.getElementById('btn-cancelar-conclusao');

// Definir data atual como padrão para data de início
const hoje = new Date();
const hojeISO = hoje.toISOString().split('T')[0];
dataInicioInput.value = hojeISO;

// Event Listeners para Leitura
btnAdicionarLivro.addEventListener('click', adicionarLivro);
btnConfirmarConclusao.addEventListener('click', confirmarConclusao);
btnCancelarConclusao.addEventListener('click', () => {
  modalConclusao.style.display = 'none';
});

// Carregar livros ao iniciar
carregarLivros();

function adicionarLivro() {
  const titulo = tituloLivroInput.value.trim();
  const dataInicio = dataInicioInput.value;
  const dataMeta = dataMetaInput.value;

  if (!titulo || !dataInicio || !dataMeta) {
    alert('Por favor, preencha todos os campos!');
    return;
  }

  const novoLivro = {
    id: Date.now(),
    titulo,
    dataInicio,
    dataMeta,
    dataConclusao: null,
    status: 'em-andamento' // em-andamento, concluído, atrasado
  };

  livros.push(novoLivro);
  salvarLivros();
  renderizarLivros();

  // Limpar campos
  tituloLivroInput.value = '';
  dataMetaInput.value = '';
}

function renderizarLivros() {
  listaDeLivros.innerHTML = '';

  if (livros.length === 0) {
    listaDeLivros.innerHTML = '<p class="sem-livros">Nenhum livro adicionado ainda.</p>';
    return;
  }

  livros.forEach(livro => {
    const livroElement = document.createElement('div');
    livroElement.className = `livro-item ${getStatusLivro(livro)}`;
    livroElement.dataset.id = livro.id;

    let statusText = '';
    if (livro.dataConclusao) {
      const diffDias = calcularDiferencaDias(livro.dataConclusao, livro.dataMeta);
      statusText = diffDias <= 0 ?  // Mudança na comparação
        `Concluído ${Math.abs(diffDias)} dias antes do prazo` : 
        `Concluído ${diffDias} dias após o prazo`;
    } else {
      const hoje = new Date().toISOString().split('T')[0];
      const diffDias = calcularDiferencaDias(livro.dataMeta, hoje);
      statusText = diffDias >= 0 ? 
        `${diffDias} dias restantes` : 
        `${Math.abs(diffDias)} dias de atraso`;
    }

    livroElement.innerHTML = `
      <div class="livro-info">
        <div class="livro-titulo">${livro.titulo}</div>
        <div class="livro-datas">
          <div class="livro-data">
            <span>Início:</span>
            <span>${formatarData(livro.dataInicio)}</span>
          </div>
          <div class="livro-data">
            <span>Meta:</span>
            <span>${formatarData(livro.dataMeta)}</span>
          </div>
          ${livro.dataConclusao ? `
            <div class="livro-data">
              <span>Conclusão:</span>
              <span>${formatarData(livro.dataConclusao)}</span>
            </div>
          ` : ''}
        </div>
        <div class="livro-status">${statusText}</div>
      </div>
      <div class="livro-acoes">
        ${!livro.dataConclusao ? `
          <button class="btn-concluir-livro" data-id="${livro.id}">✅ Concluir</button>
        ` : ''}
        <button class="btn-editar-livro" data-id="${livro.id}">✏️</button>
        <button class="btn-remover-livro" data-id="${livro.id}">🗑️</button>
      </div>
    `;

    listaDeLivros.appendChild(livroElement);
  });

  // Adicionar event listeners aos botões
  document.querySelectorAll('.btn-concluir-livro').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.target.dataset.id);
      abrirModalConclusao(id);
    });
  });

  document.querySelectorAll('.btn-editar-livro').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.target.dataset.id);
      editarLivro(id);
    });
  });

  document.querySelectorAll('.btn-remover-livro').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.target.dataset.id);
      removerLivro(id);
    });
  });
}

function abrirModalConclusao(id) {
  const livro = livros.find(l => l.id === id);
  if (!livro) return;

  modalTituloLivro.textContent = livro.titulo;
  dataConclusaoInput.valueAsDate = new Date();
  modalConclusao.style.display = 'flex';
  modalConclusao.dataset.id = id;
}

function confirmarConclusao() {
  const id = parseInt(modalConclusao.dataset.id);
  const dataConclusao = dataConclusaoInput.value;

  if (!dataConclusao) {
    alert('Por favor, informe a data de conclusão!');
    return;
  }

  const livroIndex = livros.findIndex(l => l.id === id);
  if (livroIndex === -1) return;

  livros[livroIndex].dataConclusao = dataConclusao;
  livros[livroIndex].status = 'concluido';
  salvarLivros();
  renderizarLivros();
  modalConclusao.style.display = 'none';
}

function editarLivro(id) {
  const livro = livros.find(l => l.id === id);
  if (!livro) return;

  tituloLivroInput.value = livro.titulo;
  dataInicioInput.value = livro.dataInicio;
  dataMetaInput.value = livro.dataMeta;

  // Remover o livro para edição
  livros = livros.filter(l => l.id !== id);
  salvarLivros();
  renderizarLivros();
}

function removerLivro(id) {
  if (!confirm('Tem certeza que deseja remover este livro?')) return;
  
  livros = livros.filter(l => l.id !== id);
  salvarLivros();
  renderizarLivros();
}

function salvarLivros() {
  localStorage.setItem('livros', JSON.stringify(livros));
}

function carregarLivros() {
  livros = JSON.parse(localStorage.getItem('livros')) || [];
  renderizarLivros();
}

// Funções auxiliares
function formatarData(dataString) {
  if (!dataString) return '';
  // Ajuste para compensar o fuso horário
  const date = new Date(dataString + 'T12:00:00'); // Adiciona meio-dia para evitar problemas de fuso
  const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
  return date.toLocaleDateString('pt-BR', options);
}

function calcularDiferencaDias(dataFinal, dataInicial) {
  // Ajuste para fuso horário - considera ambas as datas como UTC
  const date1 = new Date(dataFinal + 'T00:00:00');
  const date2 = new Date(dataInicial + 'T00:00:00');
  
  // Calcula a diferença em milissegundos
  const diffTime = date1 - date2;
  
  // Converte para dias
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

function getStatusLivro(livro) {
  if (livro.dataConclusao) {
    const diff = calcularDiferencaDias(livro.dataConclusao, livro.dataMeta);
    return diff <= 0 ? 'livro-no-prazo' : 'livro-atrasado'; // <= em vez de >=
  } else {
    const hoje = new Date().toISOString().split('T')[0];
    const diff = calcularDiferencaDias(livro.dataMeta, hoje);
    return diff >= 0 ? '' : 'livro-atrasado';
  }
}

// ===== SISTEMA DO ATO HERÓICO - VERSÃO CORRIGIDA ===== //
document.addEventListener('DOMContentLoaded', function() {
  // Seletores CORRETOS (usando seus IDs)
  const elements = {
    textarea: document.getElementById('ato-heroico-texto'),
    btnEditar: document.getElementById('btn-editar-ato'),
    btnConcluir: document.getElementById('btn-concluir-ato'),
    btnRealizado: document.getElementById('btn-realizado'),
    btnNaoRealizado: document.getElementById('btn-nao-realizado'),
    btnAlterarStatus: document.getElementById('btn-alterar-status'),
    diagnostico: document.getElementById('diagnostico-ato-heroico'),
    statusContainer: document.querySelector('.status-ato-heroico'),
    historico: document.getElementById('historico-ato-heroico'),
    textoExibicao: document.getElementById('texto-ato-heroico')
  };

  // Estado inicial
  let state = JSON.parse(localStorage.getItem('atoHeroicoState')) || {
    texto: '',
    editando: true,
    realizado: null,
    historico: []
  };

  // Inicialização
  function init() {
    elements.textarea.value = state.texto;
    updateUI();
    loadHistory();
  }

  // Atualiza a interface conforme o estado
  function updateUI() {
    elements.textarea.readOnly = !state.editando;
    elements.btnEditar.style.display = state.editando ? 'none' : 'inline-block';
    elements.btnConcluir.style.display = state.editando ? 'inline-block' : 'none';
    
    // CORREÇÃO: Mostrar botões quando em modo de avaliação
    elements.statusContainer.style.display = 
        (!state.editando && state.texto && state.realizado === null) ? 'flex' : 'none';
    
    elements.diagnostico.style.display = 
        (state.realizado !== null) ? 'block' : 'none';
    
    if (state.realizado !== null) {
        elements.diagnostico.className = state.realizado 
            ? 'diagnostico-realizado' 
            : 'diagnostico-nao-realizado';
    }
}

  // Event Listeners CORRETOS
  elements.btnConcluir.addEventListener('click', () => {
    if (!elements.textarea.value.trim()) {
      alert('Por favor, digite seu ato heróico!');
      return;
    }
    
    state.texto = elements.textarea.value;
    state.editando = false;
    saveState();
    updateUI();
  });

  elements.btnEditar.addEventListener('click', () => {
    state.editando = true;
    saveState();
    updateUI();
  });

  elements.btnRealizado.addEventListener('click', () => {
    registerStatus(true);
  });

  elements.btnNaoRealizado.addEventListener('click', () => {
    registerStatus(false);
  });

  elements.btnAlterarStatus.addEventListener('click', () => {
    state.realizado = null;
    saveState();
    updateUI();
  });

  // Função para registrar status
  function registerStatus(realizado) {
    const now = new Date();
    const textoAtual = elements.textarea.value;
    
    state.realizado = realizado;
    state.historico.unshift({
        date: now.toLocaleString('pt-BR'),
        status: realizado,
        text: textoAtual
    });
    
    // Limita e salva
    if (state.historico.length > 10) state.historico.pop();
    
    // NOVO: Limpa o campo para novo registro
    elements.textarea.value = '';
    state.texto = '';
    state.editando = true; // Volta para modo de edição
    
    saveState();
    updateUI();
    loadHistory();
}

  // Carrega o histórico
  function loadHistory() {
    elements.historico.innerHTML = ''; // Limpa completamente antes de recarregar
    
    state.historico.forEach((item, index) => {
        const entry = document.createElement('div');
        entry.className = `registro-ato ${item.status ? 'realizado' : 'nao-realizado'}`;
        entry.innerHTML = `
            <div class="registro-header">
                <strong>${item.date}</strong>
                <span>${item.status ? '✅' : '❌'}</span>
            </div>
            <div class="registro-texto">${item.text}</div>
        `;
        elements.historico.appendChild(entry);
    });
}

  // Salva no localStorage
  function saveState() {
    localStorage.setItem('atoHeroicoState', JSON.stringify(state));
  }

  // Inicia
  init();
});

// SISTEMA DE NOTIFICAÇÕES
const notificacaoBtn = document.getElementById('notificacao-btn');
const firebaseConfig = {
  apiKey: "AIzaSyArFPaaF04sxtCvqAMtvLCjdgO2i8l33K8",
  authDomain: "projeto-mais-clareza.firebaseapp.com",
  projectId: "projeto-mais-clareza",
  storageBucket: "projeto-mais-clareza.appspot.com",
  messagingSenderId: "785772047805",
  appId: "1:785772047805:web:25148daad54b194111b6d4"
};

let messaging = null;

// Função para registrar o Service Worker
async function registerServiceWorker() {
  try {
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/'
    });
    console.log('Service Worker registrado com sucesso:', registration);
    return registration;
  } catch (error) {
    console.error('Falha ao registrar Service Worker:', error);
    throw error;
  }
}

// Função para inicializar o Firebase Messaging
async function initializeFirebaseMessaging() {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  messaging = firebase.messaging();
  
  // Configuração adicional para desenvolvimento local
  if (window.location.hostname === "localhost") {
    messaging.usePublicVapidKey("SUA_CHAVE_VAPID_AQUI");
  }
}

// Função principal para ativar notificações
async function ativarNotificacoes() {
  try {
    // 1. Registrar Service Worker
    await registerServiceWorker();
    
    // 2. Inicializar Firebase Messaging
    await initializeFirebaseMessaging();
    
    // 3. Solicitar permissão
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Permissão concedida!');
      notificacaoBtn.textContent = '🔔✅';
      
      // 4. Obter token FCM
      const token = await messaging.getToken();
      console.log('Token FCM:', token);
      
      // 5. Agendar notificações (se aplicável)
      if (typeof agendarNotificacoes === 'function') {
        agendarNotificacoes();
      }
      
      setTimeout(() => {
        notificacaoBtn.textContent = '🔔';
      }, 2000);
    } else {
      notificacaoBtn.textContent = '🔔❌';
      setTimeout(() => {
        notificacaoBtn.textContent = '🔔';
      }, 2000);
    }
  } catch (error) {
    console.error('Erro detalhado:', error);
    notificacaoBtn.textContent = '⚠️ Erro';
    
    // Mostra detalhes do erro específico
    if (error.code === 'messaging/failed-serviceworker-registration') {
      console.error('Problema no registro do Service Worker');
    } else if (error.code === 'messaging/permission-blocked') {
      console.error('Permissões bloqueadas pelo usuário');
    }
    
    setTimeout(() => {
      notificacaoBtn.textContent = '🔔';
    }, 2000);
  }
}

// Evento de clique
notificacaoBtn.addEventListener('click', ativarNotificacoes);

// Verificação inicial de permissão
if (Notification.permission === 'granted') {
  notificacaoBtn.textContent = '🔔✅';
  // Inicializa o Firebase Messaging em segundo plano
  initializeFirebaseMessaging().catch(console.error);
}
// Evento de clique
notificacaoBtn.addEventListener('click', ativarNotificacoes);

// Verifica se já tem permissão
if (Notification.permission === 'granted') {
  notificacaoBtn.textContent = '🔔✅';
}
