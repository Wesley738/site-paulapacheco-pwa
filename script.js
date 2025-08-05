window.onload = () => {
  const emailSalvo = localStorage.getItem("emailLogado");
  if (emailSalvo) {
    emailLogado = emailSalvo;
    verificarAtividade(true); // força verificação inicial
  }
};

let livros = [];
let metas = JSON.parse(localStorage.getItem('metas')) || [];
let prioridades = JSON.parse(localStorage.getItem('prioridades')) || [];

function obterDataHojeBR() {
  const hoje = new Date();
  const dia = String(hoje.getDate()).padStart(2, '0');
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const ano = hoje.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

window.addEventListener('load', () => {
  const dataHojeBR = obterDataHojeBR();
  const dataHojeISO = new Date().toISOString().split('T')[0];

  // 1. Preenche spans com a data atual no formato DD/MM/AAAA
  document.querySelectorAll('.data-hoje').forEach(el => {
    el.textContent = dataHojeBR;
  });

  // 2. Preenche inputs do tipo date com a data atual (YYYY-MM-DD)
  document.querySelectorAll('input[type="date"].hoje').forEach(el => {
    if (!el.value) el.value = dataHojeISO;
  });

  carregarPrioridades();

  const salvo = localStorage.getItem("atoHeroicoTexto");
  if (salvo) {
    textareaAtoHeroico.value = salvo;
    textareaAtoHeroico.setAttribute("readonly", true);
    btnConcluirAto.style.display = "none";
    btnEditarAto.style.display = "block";
  }

  renderizarChecklist();

  // 📚 Inicializar botão "Adicionar Livro" com segurança
  const btnAdicionarLivro = document.getElementById('btn-adicionar-livro');
  if (btnAdicionarLivro) {
    btnAdicionarLivro.addEventListener('click', adicionarLivro);
  }

  // Garantir que a lista seja carregada
  carregarLivros();

  // Inicializa
  renderizarMetas();

  renderizarDiagnosticos();
});

// Dados salvos (mantendo suas variáveis existentes)
let tarefasChecklist = JSON.parse(localStorage.getItem('checklist')) || [
  { id: 1, texto: "Meditar por 10 minutos", concluida: false },
  { id: 2, texto: "Beber 2L de água", concluida: false }
];

let verificadorAtivo = null;
let emailLogado = "";

function verificarEmail() {
  const email = document.getElementById("emailInput").value.trim().toLowerCase();
  const url = "https://script.google.com/macros/s/AKfycbysCZoR_M2kEVR7VyFUtO6siO_HUfuzOee-MQKbhCC3yvuKpaLj7MawDXutFXNles20Jw/exec?email=" + encodeURIComponent(email);
  const mensagemErro = document.getElementById("mensagemErro");
  const btnLogin = document.getElementById("btn-login");
  const btnTexto = document.getElementById("btn-login-texto");
  const spinner = document.getElementById("spinner-login");
  
  mensagemErro.textContent = "";
  btnLogin.disabled = true;
  btnTexto.textContent = "Verificando...";
  spinner.style.display = "inline-block";

  fetch(url)
    .then(res => res.json())
    .then(data => {
      spinner.style.display = "none";
      btnLogin.disabled = false;
      btnTexto.textContent = "Entrar";

      if (data.erro || !data.ativo || data.ativo.toString().toLowerCase() !== "true") {
        document.getElementById("mensagemErro").innerText = "Acesso negado: e-mail não cadastrado ou inativo.";
        return;
      }

      // Login OK
      emailLogado = email;
      localStorage.setItem("emailLogado", email);
      document.getElementById("login-box").style.display = "none";
      document.getElementById("conteudo").style.display = "block";

      // Inicia checagem a cada 10 segundos
      if (!verificadorAtivo) {
        verificadorAtivo = setInterval(verificarAtividade, 10000);
      }
    })
    
    .catch(() => {
      spinner.style.display = "none";
      btnLogin.disabled = false;
      btnTexto.textContent = "Entrar";
      mensagemErro.textContent = "Erro ao verificar. Tente novamente.";
    })    
}

function verificarAtividade(inicial = false) {
  const url = "https://script.google.com/macros/s/AKfycbysCZoR_M2kEVR7VyFUtO6siO_HUfuzOee-MQKbhCC3yvuKpaLj7MawDXutFXNles20Jw/exec?email=" + encodeURIComponent(emailLogado);

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (!data.ativo || data.ativo.toString().toLowerCase() !== "true") {
        if (!inicial) alert("Você foi desconectado. Seu acesso foi desativado pelo administrador.");
        sair();
        return;
      }

      // Se for carregamento inicial, mostra o conteúdo
      if (inicial) {
        document.getElementById("login-box").style.display = "none";
        document.getElementById("conteudo").style.display = "block";

        if (!verificadorAtivo) {
          verificadorAtivo = setInterval(verificarAtividade, 10000);
        }
      }
    });
}


function sair() {
  document.getElementById("conteudo").style.display = "none";
  document.getElementById("login-box").style.display = "block";
  document.getElementById("emailInput").value = "";
  document.getElementById("mensagemErro").innerText = "";
  emailLogado = "";
  localStorage.removeItem("emailLogado");
  
  if (verificadorAtivo) {
    clearInterval(verificadorAtivo); // 🔒 para o verificador
    verificadorAtivo = null;
  }
}

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

// Quebras de Linhas
const novaMetaTextarea = document.getElementById('nova-meta');
if (novaMetaTextarea) {
  novaMetaTextarea.addEventListener('input', () => {
    novaMetaTextarea.style.height = 'auto'; // Reseta altura
    novaMetaTextarea.style.height = novaMetaTextarea.scrollHeight + 'px'; // Ajusta altura
  });
}

const novoLivroTextarea = document.getElementById('titulo-livro');
if(novoLivroTextarea) {
  novoLivroTextarea.addEventListener('input', () => {
    novoLivroTextarea.style.height = 'auto';
    novoLivroTextarea.style.height = novoLivroTextarea.scrollHeight + 'px';
  })
}

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
  
  // Atualiza botão de limpar concluídas
  const totalConcluidas = metas.filter(m => m.concluida).length;
  const btnLimpar = document.getElementById('limpar-concluidas');
  
  if (totalConcluidas > 0) {
    btnLimpar.style.display = 'flex';
    btnLimpar.innerHTML = `🗑️ Limpar Todas Concluídas (${totalConcluidas})`;
  } else {
    btnLimpar.style.display = 'none';
  }

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

function configurarAutoexpansaoPrioridades() {
  const campos = document.querySelectorAll('.input-prioridade');

  campos.forEach(campo => {
    // Expande automaticamente se já tiver texto
    campo.style.height = 'auto';
    campo.style.height = campo.scrollHeight + 'px';

    // Expande conforme o usuário digita
    campo.addEventListener('input', () => {
      campo.style.height = 'auto';
      campo.style.height = campo.scrollHeight + 'px';
    });
  });
}

// Chama após o carregamento da página
window.addEventListener('load', () => {
  configurarAutoexpansaoPrioridades();
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

// Salvando Ato Heroico
const textareaAtoHeroico = document.getElementById("ato-heroico-texto");
const btnConcluirAto = document.getElementById("btn-concluir-ato");
const btnEditarAto = document.getElementById("btn-editar-ato");

// Evento para salvar o conteúdo
btnConcluirAto.addEventListener("click", () => {
  textareaAtoHeroico.setAttribute("readonly", true);
  btnConcluirAto.style.display = "none";
  btnEditarAto.style.display = "block";
  localStorage.setItem("atoHeroicoTexto", textareaAtoHeroico.value);
});

// Evento para permitir edição novamente
btnEditarAto.addEventListener("click", () => {
  textareaAtoHeroico.removeAttribute("readonly");
  btnEditarAto.style.display = "none";
  btnConcluirAto.style.display = "block";
  textareaAtoHeroico.focus();
});

// Função para limpar os relatórios de Ato Heroico
document.getElementById('btn-limpar-ato-heroico').addEventListener('click', () => {
  if (confirm('💣 Isso apagará TODOS os relatórios de atos heroicos. Deseja continuar?')) {
    localStorage.removeItem('relatoriosAtoHeroico');
    document.getElementById('relatorios-ato-heroico').innerHTML = '';
    resetarAtoHeroico();
    alert('Todos os atos heroicos foram removidos!');
  }
});

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
});

// Função para criar um relatório HTML
function criarDiagnostico(diagnostico) {
  return `
    <div class="relatorio" data-timestamp="${diagnostico.timestamp}">
      <button class="btn-excluir-diagnostico" title="Excluir diagnóstico" onclick="excluirDiagnostico(${diagnostico.id})">🗑️</button>
      <h3 class="diagnostico-titulo">Diagnóstico - ${diagnostico.data}</h3>
      <div class="diagnostico-item">
        <h4>🙏 Agradecimentos:</h4>
        <p class="diagnostico-texto">${diagnostico.agradecimentos || "Nenhum registro"}</p>
      </div>
      <div class="diagnostico-item">
        <h4>🔍 Pontos Fortes e Fracos:</h4>
        <p class="diagnostico-texto">${diagnostico.melhorias || "Nenhum registro"}</p>
      </div>
    </div>
  `;
}

function excluirDiagnostico(id) {
  if (!confirm("Deseja realmente excluir este diagnóstico?")) return;

  let diagnosticos = JSON.parse(localStorage.getItem('historicoDiagnosticos')) || [];

  // Garante que a comparação seja feita entre tipos iguais
  diagnosticos = diagnosticos.filter(r => String(r.id) !== String(id));

  localStorage.setItem('historicoDiagnosticos', JSON.stringify(diagnosticos));
  renderizarDiagnosticos();
}

// Função para renderizar TODOS os relatórios (do mais novo pro mais antigo)
function renderizarDiagnosticos() {
  const container = document.getElementById('container-diagnosticos');
  const historico = JSON.parse(localStorage.getItem('historicoDiagnosticos')) || [];
  
  container.innerHTML = '';
  
  // Ordena do mais recente pro mais antigo
  historico.sort((a, b) => b.timestamp - a.timestamp).forEach(diagnostico => {
    container.innerHTML += criarDiagnostico(diagnostico);
  });
}

// Função para adicionar novo diagnóstico
document.getElementById('btn-finalizar-diagnostico').addEventListener('click', () => {
  if (!confirm('Finalizar edição e gerar diagnóstico?')) return;

  const novoDiagnostico = {
    id: Date.now(),
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

  // Restaura agradecimentos para modo edição
  const agradecimentos = document.getElementById("agradecimentos");
  const btnConcluirA = document.getElementById("btn-concluir-agradecimentos");
  const btnEditarA = document.getElementById("btn-editar-agradecimentos");

  agradecimentos.removeAttribute("readonly");
  btnConcluirA.style.display = "inline-block";
  btnEditarA.style.display = "none";

  // Restaura melhorias para modo edição
  const melhorias = document.getElementById("melhorias");
  const btnConcluirM = document.getElementById("btn-concluir-melhorias");
  const btnEditarM = document.getElementById("btn-editar-melhorias");

  melhorias.removeAttribute("readonly");
  btnConcluirM.style.display = "inline-block";
  btnEditarM.style.display = "none";

  // Limpa campos e renderiza
  document.getElementById('agradecimentos').value = '';
  document.getElementById('melhorias').value = '';
  // document.getElementById
  renderizarDiagnosticos();
});

// Botão Nuclear (limpar TUDO)
document.getElementById('btn-nuclear').addEventListener('click', () => {
  if (confirm('💣 ATENÇÃO! Isso apagará TODOS os diagnósticos. Continuar?')) {
    localStorage.removeItem('historicoDiagnosticos');
    document.getElementById('container-diagnosticos').innerHTML = '';
    alert('Todos os diagnósticos foram removidos!');

    // Restaura agradecimentos para modo edição
    const agradecimentos = document.getElementById("agradecimentos");
    const btnConcluirA = document.getElementById("btn-concluir-agradecimentos");
    const btnEditarA = document.getElementById("btn-editar-agradecimentos");

    agradecimentos.removeAttribute("readonly");
    btnConcluirA.style.display = "inline-block";
    btnEditarA.style.display = "none";

    // Restaura melhorias para modo edição
    const melhorias = document.getElementById("melhorias");
    const btnConcluirM = document.getElementById("btn-concluir-melhorias");
    const btnEditarM = document.getElementById("btn-editar-melhorias");

    melhorias.removeAttribute("readonly");
    btnConcluirM.style.display = "inline-block";
    btnEditarM.style.display = "none";

    agradecimentos.value = '';
    melhorias.value = '';
  }
});

// Seção Leitura - Variáveis
livros = JSON.parse(localStorage.getItem("livrosLeitura")) || [];

// Elementos da seção Leitura
const tituloLivroInput = document.getElementById('titulo-livro');
const dataInicioInput = document.getElementById('data-inicio');
const dataMetaInput = document.getElementById('data-meta');
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

  livros.unshift(novoLivro);
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

  tituloLivroInput.focus();
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
  localStorage.setItem('livrosLeitura', JSON.stringify(livros));
}

function carregarLivros() {
  livros = JSON.parse(localStorage.getItem("livrosLeitura")) || [];
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

// Variáveis globais
let atoHeroicoEditavel = true;
const RELATORIOS_KEY = 'relatoriosAtoHeroico';

function exibirRelatorio(mensagem, texto, tipo, data = new Date()) {
  const container = document.getElementById("relatorios-ato-heroico");

  const div = document.createElement("div");
  div.className = `relatorio ${tipo}`;

  const dataFormatada = new Date(data).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });

  div.innerHTML = `
    <p class="data-relatorio">${dataFormatada}</p>
    <p class="ato-texto"><strong>${texto}</strong></p>
    <p class="mensagem-resultado">${mensagem}</p>
    <button class="btn-remover-relatorio">🗑️</button>
    <hr>
  `;

  container.prepend(div);

  div.querySelector(".btn-remover-relatorio").addEventListener("click", () => {
    if (!confirm("Deseja realmente excluir este relatório?")) return;
    div.remove();
    removerRelatorioDoLocalStorage(data, texto, mensagem, tipo);
  });
}

// Cria e exibe um novo relatório
function adicionarRelatorio(mensagem, texto, tipo, data = new Date()) {
  exibirRelatorio(mensagem, texto, tipo, data); // Só exibe

  // E salva no localStorage
  const relatoriosSalvos = JSON.parse(localStorage.getItem("relatoriosAtoHeroico")) || [];
  relatoriosSalvos.unshift({ mensagem, texto, tipo, data });
  localStorage.setItem("relatoriosAtoHeroico", JSON.stringify(relatoriosSalvos));
}

// Carrega todos os relatórios já salvos
function carregarRelatorios() {
  const container = document.getElementById("relatorios-ato-heroico");
  container.innerHTML = "";

  const relatoriosSalvos = JSON.parse(localStorage.getItem("relatoriosAtoHeroico")) || [];

  relatoriosSalvos.reverse().forEach(({ mensagem, texto, tipo, data }) => {
    exibirRelatorio(mensagem, texto, tipo, data);
  });
}

// Remove relatório do localStorage com base no conteúdo
function removerRelatorioDoLocalStorage(data, texto, mensagem, tipo) {
  const relatoriosSalvos = JSON.parse(localStorage.getItem("relatoriosAtoHeroico")) || [];

  const dataISO = new Date(data).toISOString(); // Garantir formato comparável

  const atualizados = relatoriosSalvos.filter(r => {
    const rDataISO = new Date(r.data).toISOString();
    return !(
      rDataISO === dataISO &&
      r.texto === texto &&
      r.mensagem === mensagem &&
      r.tipo === tipo
    );
  });

  localStorage.setItem("relatoriosAtoHeroico", JSON.stringify(atualizados));
}

function resetarAtoHeroico() {
  const textarea = document.getElementById("ato-heroico-texto");
  const btnConcluir = document.getElementById("btn-concluir-ato");
  const btnEditar = document.getElementById("btn-editar-ato");
  const confirmacaoDiv = document.getElementById("confirmacao-ato");

  textarea.removeAttribute("readonly");
  textarea.value = "";
  btnEditar.style.display = "none";
  btnConcluir.style.display = "block";
  confirmacaoDiv.style.display = "none";

  // Remover do localStorage também
  localStorage.removeItem("atoHeroicoTexto");
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
  // Carregar relatórios ao iniciar
  carregarRelatorios();
  
  // Elementos
  const btnConcluirAto = document.getElementById('btn-concluir-ato');
  const btnEditarAto = document.getElementById('btn-editar-ato');
  const confirmacaoAto = document.getElementById('confirmacao-ato');
  const btnSim = document.getElementById('btn-sim');
  const btnNao = document.getElementById('btn-nao');
  const relatoriosContainer = document.getElementById('relatorios-ato-heroico');
  
  const atoHeroicoTexto = document.getElementById('ato-heroico-texto');
  // Ajusta dinamicamente a altura do textarea conforme o conteúdo
  atoHeroicoTexto.addEventListener("input", () => {
    atoHeroicoTexto.style.height = "auto"; // Resetar primeiro
    atoHeroicoTexto.style.height = atoHeroicoTexto.scrollHeight + "px";
  });

  const agradecimentosTextarea = document.getElementById("agradecimentos");
  const melhoriasTextarea = document.getElementById("melhorias");

  [agradecimentosTextarea, melhoriasTextarea].forEach(textarea => {
    if (textarea) {
      // Altura dinâmica
      textarea.addEventListener("input", () => {
        textarea.style.height = "auto";
        textarea.style.height = textarea.scrollHeight + "px";
      });

      // Ajuste inicial ao carregar
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    }
  });

  // Concluir edição do ato heroico
  btnConcluirAto.addEventListener('click', function() {
    if (!atoHeroicoTexto.value.trim()) {
      alert('Por favor, digite seu ato heroico antes de concluir.');
      return;
    }
    
    atoHeroicoEditavel = false;
    atoHeroicoTexto.readOnly = true;
    btnConcluirAto.style.display = 'none';
    btnEditarAto.style.display = 'block';
    confirmacaoAto.style.display = 'block';
  });
  
  // Editar ato heroico
  btnEditarAto.addEventListener('click', function() {
    atoHeroicoEditavel = true;
    atoHeroicoTexto.readOnly = false;
    btnConcluirAto.style.display = 'block';
    btnEditarAto.style.display = 'none';
    confirmacaoAto.style.display = 'none';
  });

  // Botão Sim (conseguiu realizar)
  btnSim.addEventListener("click", () => {
    const texto = atoHeroicoTexto.value.trim();
    if (!texto) {
      alert("Você precisa escrever um ato heroico antes!");
      return;
    }
    if (!atoHeroicoTexto.hasAttribute("readonly")) {
      alert("Conclua a edição do ato heroico antes de confirmar.");
      return;
    }
    adicionarRelatorio("Você REALIZOU o ato heroico!", texto, "positivo");
    resetarAtoHeroico();
  });
  
  // Botão Não (não conseguiu realizar)
  btnNao.addEventListener("click", () => {
    const texto = atoHeroicoTexto.value.trim();
    if (!texto) {
      alert("Você precisa escrever um ato heroico antes!");
      return;
    }
    if (!atoHeroicoTexto.hasAttribute("readonly")) {
      alert("Conclua a edição do ato heroico antes de confirmar.");
      return;
    }
    adicionarRelatorio("Você NÃO realizou o ato heroico!", texto, "negativo");
    resetarAtoHeroico();
  });
  
  // Delegar evento para botões de excluir (que são dinâmicos)
  relatoriosContainer.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn-excluir-diagnostico')) {
      const idRelatorio = e.target.getAttribute('data-id');
      const relatoriosSalvos = JSON.parse(localStorage.getItem(RELATORIOS_KEY)) || [];
      
      const relatoriosAtualizados = relatoriosSalvos.filter(
        relatorio => relatorio.id !== idRelatorio
      );
      
      localStorage.setItem(RELATORIOS_KEY, JSON.stringify(relatoriosAtualizados));
      carregarRelatorios();
      
      // Se for o relatório mais recente, permite editar novamente
      if (relatoriosAtualizados.length === 0 || 
          relatoriosAtualizados[0].id !== idRelatorio) {
        return;
      }
      
      // Se estiver excluindo o relatório mais recente, permite editar o ato novamente
      atoHeroicoEditavel = true;
      atoHeroicoTexto.readOnly = false;
      btnConcluirAto.style.display = 'block';
      btnEditarAto.style.display = 'none';
      confirmacaoAto.style.display = 'none';
    }
  });

  // Botão limpar todos os livros
  const btnLimparLivros = document.getElementById("btn-limpar-livros");

  if (btnLimparLivros) {
    btnLimparLivros.addEventListener("click", () => {
      if (confirm("💣 Tem certeza que deseja apagar todos os livros?")) {
        localStorage.removeItem("livrosLeitura");
        livros = [];
        document.getElementById("lista-livros").innerHTML = "";
        alert("Todos os livros foram apagados!");
      }
    });
  }
});

// Lista de seções em ordem
const secoes = ["metas", "prioridades", "checklist", "leitura", "reflexao"];
let indiceAtual = 0;

// Detecta qual seção está visível no início
function detectarSecaoVisivel() {
  secoes.forEach((id, index) => {
    const sec = document.getElementById(id);
    if (sec && sec.style.display !== "none") {
      indiceAtual = index;
    }
  });
}

// Navega para a próxima ou anterior (direção: 1 ou -1)
function navegarEntreSecoes(direcao) {
  indiceAtual = (indiceAtual + direcao + secoes.length) % secoes.length;

  // Atualiza visualmente
  document.querySelectorAll('section').forEach(sec => {
    sec.style.display = 'none';
  });

  const secaoAlvo = document.getElementById(secoes[indiceAtual]);
  if (secaoAlvo) {
    secaoAlvo.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Atualiza a navbar
  document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('ativo'));
  const navAtivo = document.querySelector(`.nav-item[href="#${secoes[indiceAtual]}"]`);
  if (navAtivo) navAtivo.classList.add('ativo');
}

// Detectar swipe
let startX = 0;
let endX = 0;

document.addEventListener('touchstart', e => {
  startX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', e => {
  endX = e.changedTouches[0].screenX;
  const diff = endX - startX;

  detectarSecaoVisivel(); // garante que estamos na posição certa

  if (Math.abs(diff) > 50) { // limite mínimo para considerar swipe
    if (diff < 0) {
      navegarEntreSecoes(1); // 👉 para esquerda = próxima seção
    } else {
      navegarEntreSecoes(-1); // 👈 para direita = seção anterior
    }
  }
});