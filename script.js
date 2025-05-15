// Dados salvos
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

  // Validação DEBUG (verifique no console)
  console.log("Meta digitada:", textoMeta);
  console.log("Pilar selecionado:", pilar);

  if (!textoMeta) {
    alert("⚠️ Digite uma meta válida!");
    return;
  }

  // Adiciona a meta
  metas.push({ 
    texto: textoMeta, 
    pilar: pilar, 
    concluida: false 
  });

  // Salva e atualiza
  localStorage.setItem('metas', JSON.stringify(metas));
  inputMeta.value = '';
  renderizarMetas();
});

// Renderiza as metas
function renderizarMetas() {
  const listaMetas = document.querySelector('.lista-metas');
  listaMetas.innerHTML = '';

  // Agrupa por pilar
  const pilares = {
    'saude-fisica': { titulo: '💪 Saúde Física', metas: [] },
    'saude-espiritual': { titulo: '🧘 Saúde Espiritual', metas: [] },
    'estudos': { titulo: '📚 Estudos', metas: [] },
    'familia': { titulo: '👨‍👩‍👧‍👦 Família', metas: [] },
    'trabalho': { titulo: '💼 Trabalho', metas: [] }
  };

  metas.forEach((meta, index) => {
    pilares[meta.pilar].metas.push({ ...meta, index });
  });

  // Exibe na tela
  for (const pilar in pilares) {
    if (pilares[pilar].metas.length > 0) {
      const container = document.createElement('div'); // DECLARADO AQUI
      container.className = 'pilar-container';

      const titulo = document.createElement('div');
      titulo.className = 'pilar-titulo';
      titulo.textContent = pilares[pilar].titulo;
      container.appendChild(titulo);

      pilares[pilar].metas.forEach(meta => {
        const item = document.createElement('div');
        item.className = `meta-item ${meta.concluida ? 'concluida' : ''}`;

        // Checkbox
        const checkboxContainer = document.createElement('label');
        checkboxContainer.className = 'checkbox-container';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'checkbox-concluida';
        checkbox.checked = meta.concluida;
        checkbox.onchange = () => toggleConcluirMeta(meta.index);
        
        const checkmark = document.createElement('span');
        checkmark.className = 'checkmark';
        
        checkboxContainer.appendChild(checkbox);
        checkboxContainer.appendChild(checkmark);
        item.appendChild(checkboxContainer);

        // Texto da Meta
        const textoMeta = document.createElement('span');
        textoMeta.className = 'texto-meta';
        textoMeta.textContent = meta.texto;
        item.appendChild(textoMeta);

        // Botões de Ação
        const acoes = document.createElement('div');
        acoes.className = 'acoes-meta';
        
        const btnEditar = document.createElement('button');
        btnEditar.className = 'btn-editar';
        btnEditar.innerHTML = '✏️';
        btnEditar.onclick = (e) => {
          e.stopPropagation(); // Evita conflito com o checkbox
          editarMeta(meta.index);
        };
        
        const btnDeletar = document.createElement('button');
        btnDeletar.className = 'btn-deletar';
        btnDeletar.innerHTML = '🗑️';
        btnDeletar.onclick = (e) => {
          e.stopPropagation(); // Evita conflito com o checkbox
          removerMeta(meta.index);
        };
        
        acoes.appendChild(btnEditar);
        acoes.appendChild(btnDeletar);
        item.appendChild(acoes);

        container.appendChild(item);
      });

      listaMetas.appendChild(container);
    }
  }

  const totalConcluidas = metas.filter(m => m.concluida).length;
  const btnLimpar = document.getElementById('limpar-concluidas');
  
  if (totalConcluidas > 0) {
    btnLimpar.style.display = 'flex';
    btnLimpar.innerHTML = `🗑️ Limpar Concluídas (${totalConcluidas})`;
  } else {
    btnLimpar.style.display = 'none';
  }
}

function toggleConcluirMeta(index) {
  metas[index].concluida = !metas[index].concluida;
  localStorage.setItem('metas', JSON.stringify(metas));
  renderizarMetas();
}

function editarMeta(index) {
  const novaMeta = prompt("Editar meta:", metas[index].texto);
  if (novaMeta && novaMeta.trim() !== '') {
    metas[index].texto = novaMeta.trim();
    localStorage.setItem('metas', JSON.stringify(metas));
    renderizarMetas();
  }
}

function removerMeta(index) {
  if (confirm("Tem certeza que quer deletar esta meta?")) {
    metas.splice(index, 1);
    localStorage.setItem('metas', JSON.stringify(metas));
    renderizarMetas();
  }
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