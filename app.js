(() => {
  'use strict';

  const STORAGE_KEY = 'diva-life-v1';
  const pad = n => String(n).padStart(2, '0');
  const todayKey = () => dateKey(new Date());
  const dateKey = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  const parseLocalDate = s => { const [y,m,d] = s.split('-').map(Number); return new Date(y,m-1,d); };
  const uid = (p='id') => `${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,7)}`;
  const esc = s => String(s ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const fmtDate = (s, opts={day:'2-digit',month:'short'}) => s ? new Intl.DateTimeFormat('pt-BR', opts).format(parseLocalDate(s)) : '';
  const fmtMoney = n => Number(n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  const minutesLabel = m => m >= 60 ? `${Math.floor(m/60)}h${m%60 ? ` ${m%60}min` : ''}` : `${m}min`;
  const priorityWeight = p => ({alta:3,media:2,baixa:1}[p] || 0);
  const nowMinutes = () => new Date().getHours()*60 + new Date().getMinutes();
  const el = id => document.getElementById(id);

  const defaults = {
    version: 1,
    preferences: {
      energy: 'media',
      availableMinutes: 120,
      mainPriorityId: null,
      notificationsAsked: false,
      name: 'Diva'
    },
    areas: [
      {id:'medicina', name:'Medicina', emoji:'🩺'},
      {id:'pessoal', name:'Pessoal', emoji:'✨'},
      {id:'casa', name:'Casa', emoji:'🏠'},
      {id:'financeiro', name:'Financeiro', emoji:'💸'},
      {id:'viagens', name:'Viagens', emoji:'✈️'},
      {id:'projetos', name:'Projetos', emoji:'◇'}
    ],
    tasks: [
      {id:'seed_1', title:'Revisar uma prioridade da faculdade', area:'medicina', priority:'alta', due:todayKey(), time:'', duration:45, notes:'Escolha o conteúdo mais urgente do dia.', completed:false, archived:false, createdAt:new Date().toISOString(), reminder:0},
      {id:'seed_2', title:'Organizar pendências pessoais', area:'pessoal', priority:'media', due:'', time:'', duration:20, notes:'', completed:false, archived:false, createdAt:new Date().toISOString(), reminder:0}
    ],
    events: [
      {id:'class_mon1', title:'Habilidades Médicas', date:'*', days:[1], time:'08:00', area:'medicina', kind:'routine'},
      {id:'class_mon2', title:'TBL', date:'*', days:[1], time:'13:00', area:'medicina', kind:'routine'},
      {id:'class_tue1', title:'Ambulatório', date:'*', days:[2], time:'08:00', area:'medicina', kind:'routine'},
      {id:'class_tue2', title:'TOCE', date:'*', days:[2], time:'13:00', area:'medicina', kind:'routine'},
      {id:'class_wed1', title:'Laboratório Morfofuncional', date:'*', days:[3], time:'10:00', area:'medicina', kind:'routine'},
      {id:'class_wed2', title:'Prática Médica no SUS', date:'*', days:[3], time:'13:30', area:'medicina', kind:'routine'},
      {id:'class_thu1', title:'Ambulatório', date:'*', days:[4], time:'08:00', area:'medicina', kind:'routine'},
      {id:'class_thu2', title:'UBS', date:'*', days:[4], time:'13:00', area:'medicina', kind:'routine'},
      {id:'class_fri1', title:'Tutoria', date:'*', days:[5], time:'08:00', area:'medicina', kind:'routine'},
      {id:'gym_mon', title:'Academia', date:'*', days:[1], time:'16:00', area:'pessoal', kind:'routine'},
      {id:'gym_wed', title:'Academia', date:'*', days:[3], time:'16:00', area:'pessoal', kind:'routine'},
      {id:'gym_fri', title:'Academia', date:'*', days:[5], time:'14:00', area:'pessoal', kind:'routine'},
      {id:'massage_fri', title:'Massagem', date:'*', days:[5], time:'15:15', area:'pessoal', kind:'routine'},
      {id:'yoga_wed', title:'Ioga · horário sugerido', date:'*', days:[3], time:'19:30', area:'pessoal', kind:'routine'},
      {id:'study_fri', title:'Estudo da faculdade', date:'*', days:[5], time:'16:00', area:'medicina', kind:'routine'},
      {id:'cardio_thu', title:'Cardio leve', date:'*', days:[4], time:'10:30', area:'pessoal', kind:'routine'},
      {id:'cardio_sat', title:'Cardio ao ar livre', date:'*', days:[6], time:'09:00', area:'pessoal', kind:'routine'},
      {id:'yoga_sat', title:'Ioga · horário sugerido', date:'*', days:[6], time:'11:00', area:'pessoal', kind:'routine'},
      {id:'plan_sun', title:'Organizar a semana', date:'*', days:[0], time:'18:00', area:'pessoal', kind:'routine'},
      {id:'read_daily', title:'Leitura · 20 min', date:'*', days:[0,1,2,3,4,5,6], time:'20:30', area:'pessoal', kind:'routine'},
      {id:'breakfast_daily', title:'Café da manhã', date:'*', days:[0,1,2,3,4,5,6], time:'07:00', area:'pessoal', kind:'routine'},
      {id:'night_skin', title:'Skincare', date:'*', days:[0,1,2,3,4,5,6], time:'21:30', area:'pessoal', kind:'routine'},
      {id:'night_bed', title:'Deitar na cama · sem celular', date:'*', days:[0,1,2,3,4,5,6], time:'22:00', area:'pessoal', kind:'routine'},
      {id:'night_meditation', title:'Meditação para dormir', date:'*', days:[0,1,2,3,4,5,6], time:'22:10', area:'pessoal', kind:'routine'}
    ],
    projects: [
      {id:'proj_app', title:'Organizar minha vida com o DIVA', area:'pessoal', description:'Deixar o sistema do jeito que funciona para mim.', archived:false, steps:[
        {id:'ps1', title:'Usar o Meu dia por 3 dias', done:false},
        {id:'ps2', title:'Adicionar minhas tarefas reais', done:false},
        {id:'ps3', title:'Ajustar categorias e rotina', done:false}
      ]}
    ],
    habits: [
      {id:'h_breakfast', title:'Café da manhã', emoji:'☀️'},
      {id:'h_skin', title:'Skincare · 21h30', emoji:'🧴'},
      {id:'h_bed', title:'Deitar · 22h', emoji:'🌙'},
      {id:'h_meditate', title:'Meditação · 22h10', emoji:'🧘🏻‍♀️'}
    ],
    habitChecks: {},
    dayChecks: {},
    dayOverrides: {},
    medicine: {
      assessments: [],
      reviews: []
    },
    finance: {
      income: 6000,
      categories: [
        {id:'f1', name:'Contas e fixos', planned:0},
        {id:'f2', name:'Mercado', planned:0},
        {id:'f3', name:'Lazer e compras', planned:0},
        {id:'f4', name:'Transporte', planned:0},
        {id:'f5', name:'Saúde e autocuidado', planned:0}
      ]
    },
    notificationLog: {}
  };

  function deepClone(v){ return JSON.parse(JSON.stringify(v)); }
  function mergeDefaults(saved){
    const base = deepClone(defaults);
    if(!saved || typeof saved !== 'object') return base;
    return {
      ...base,
      ...saved,
      preferences:{...base.preferences,...(saved.preferences||{})},
      medicine:{...base.medicine,...(saved.medicine||{})},
      finance:{...base.finance,...(saved.finance||{})},
      areas:Array.isArray(saved.areas)?saved.areas:base.areas,
      tasks:Array.isArray(saved.tasks)?saved.tasks:base.tasks,
      events:Array.isArray(saved.events)?[...saved.events, ...base.events.filter(e=>!saved.events.some(old=>old.id===e.id))]:base.events,
      projects:Array.isArray(saved.projects)?saved.projects:base.projects,
      habits:Array.isArray(saved.habits)?saved.habits:base.habits,
      habitChecks:saved.habitChecks||{},
      dayChecks:saved.dayChecks||{},
      dayOverrides:saved.dayOverrides||{},
      notificationLog:saved.notificationLog||{}
    };
  }

  let state;
  try { state = mergeDefaults(JSON.parse(localStorage.getItem(STORAGE_KEY))); }
  catch { state = deepClone(defaults); }
  let currentView = 'hoje';
  let taskFilter = 'ativas';
  let calendarCursor = new Date(); calendarCursor.setDate(1);
  let selectedDate = todayKey();
  let dayViewDate = todayKey();
  let deferredInstallPrompt = null;
  let toastTimer;

  function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  function areaById(id){ return state.areas.find(a=>a.id===id) || {name:'Outro',emoji:'•'}; }
  function eventsForDate(key){
    const d = parseLocalDate(key), day = d.getDay();
    return state.events.filter(e => (e.date===key) || (e.date==='*' && (!e.days || e.days.includes(day))));
  }
  function tasksForDate(key){ return state.tasks.filter(t => !t.archived && !t.completed && t.due===key); }
  function assessmentDaysLeft(date){ return Math.ceil((parseLocalDate(date)-parseLocalDate(todayKey()))/86400000); }

  function toast(msg){
    clearTimeout(toastTimer); el('toast').textContent = msg; el('toast').classList.remove('hidden');
    toastTimer=setTimeout(()=>el('toast').classList.add('hidden'),2400);
  }

  function renderAll(){
    renderHeader(); renderToday(); renderTasks(); renderCalendar(); renderProjects(); renderMedicine(); renderHabits(); renderFinance();
  }

  function renderHeader(){
    el('greeting').textContent = 'Qualquer progresso é melhor do que ficar parada. ✨';
  }

  function dayRelevantTasks(){
    const today=todayKey();
    return state.tasks.filter(t=>!t.archived && !t.completed && (!t.due || t.due<=today));
  }

  function smartScore(t){
    let score = priorityWeight(t.priority)*30;
    const today=todayKey();
    if(t.due){
      const days=Math.ceil((parseLocalDate(t.due)-parseLocalDate(today))/86400000);
      if(days<0) score += 60;
      else if(days===0) score += 45;
      else if(days===1) score += 30;
      else if(days<=3) score += 18;
    }
    const energy=state.preferences.energy;
    const dur=Number(t.duration||30);
    if(energy==='baixa') score += dur<=30 ? 18 : dur>90 ? -18 : 0;
    if(energy==='alta') score += dur>=45 ? 8 : 2;
    if(t.area==='medicina') score += 3;
    return score;
  }

  function renderToday(){
    document.querySelectorAll('#energySwitch button').forEach(b=>b.classList.toggle('active',b.dataset.energy===state.preferences.energy));

    const dayList=dayItems(todayKey()), done=dayList.filter(i=>dayDone(todayKey(),i)).length;
    const pct=dayList.length?Math.round(done/dayList.length*100):0;
    el('dayProgressText').textContent=`${done}/${dayList.length} · ${pct}%`;
    el('dayProgressBar').style.width=`${pct}%`;
    const priority=state.tasks.find(t=>t.id===state.preferences.mainPriorityId && !t.archived && !t.completed);
    if(priority){
      const a=areaById(priority.area);
      el('priorityTitle').textContent='Escolha uma tarefa';
      el('priorityCard').classList.remove('empty-state');
      el('priorityCard').innerHTML=`<div class="task-card" style="border:0;box-shadow:none;padding:0"><button class="check-btn" data-complete="${priority.id}" aria-label="Concluir">✓</button><div><div class="task-title">${esc(priority.title)}</div><div class="meta-row"><span class="tag">${a.emoji} ${esc(a.name)}</span><span class="tag ${priority.priority}">${priority.priority==='alta'?'Alta':priority.priority==='media'?'Média':'Baixa'} prioridade</span><span class="tag">⏱ ${minutesLabel(priority.duration||30)}</span></div>${priority.notes?`<div class="task-note">${esc(priority.notes)}</div>`:''}</div><button class="more-btn" data-edit-task="${priority.id}">•••</button></div>`;
    } else {
      el('priorityTitle').textContent='Escolha uma tarefa';
      el('priorityCard').classList.add('empty-state');
      el('priorityCard').textContent='Toque em Definir para escolher.';
    }

    renderDayTimeline();
  }

  function dayItems(key){
    const overrides=state.dayOverrides[key]||{};
    return [...eventsForDate(key).filter(e=>!overrides[e.id]?.deleted).map(e=>({...e,...(overrides[e.id]||{}),source:'event',sourceId:e.id,type:e.kind==='routine'?'Rotina':'Compromisso'})),
      ...state.tasks.filter(t=>!t.archived&&t.due===key).map(t=>({...t,source:'task',sourceId:t.id,type:'Tarefa'}))]
      .sort((a,b)=>(a.time||'99:99').localeCompare(b.time||'99:99'));
  }
  function dayDone(key,i){return i.source==='task'?!!i.completed:!!state.dayChecks[key]?.[i.sourceId]}
  function renderDayTimeline(){
    const key=dayViewDate,items=dayItems(key),done=items.filter(i=>dayDone(key,i)).length;
    el('dayDate').value=key;el('dayCount').textContent=`${done} de ${items.length} concluídos`;
    el('dayChecklistProgress').style.width=`${items.length?done/items.length*100:0}%`;
    const itemHTML=i=>`<div class="day-check-item ${dayDone(key,i)?'is-done':''}">
      <span class="timeline-time">${esc(i.time||'—')}</span>
      <button class="day-check" data-day-check="${esc(i.source)}|${esc(i.sourceId)}" aria-label="${dayDone(key,i)?'Desmarcar':'Concluir'} ${esc(i.title)}" aria-pressed="${dayDone(key,i)}">${dayDone(key,i)?'✓':''}</button>
      <div class="day-check-info"><b>${esc(i.title)}</b><small>${areaById(i.area).emoji} ${esc(i.type)}${i.notes?' · '+esc(i.notes):''}</small></div>
      ${i.source==='event'?`<button class="day-edit" data-day-edit="${esc(i.sourceId)}" aria-label="Editar ${esc(i.title)}">⋯</button>`:''}
    </div>`;
    el('todayTimeline').innerHTML=items.length?items.filter(i=>i.time).map(itemHTML).join('')+
      (items.some(i=>!i.time)?'<div class="day-untimed">Sem horário</div>'+items.filter(i=>!i.time).map(itemHTML).join(''):''):
      '<div class="empty-state compact">Nada programado neste dia. Adicione um compromisso ✨</div>';
  }
  function dayEventForm(id=null){
    const key=dayViewDate,original=id?state.events.find(e=>e.id===id):null;
    if(id&&!original)return;
    const current=original?{...original,...(state.dayOverrides[key]?.[id]||{})}:null;
    openModal(original?'Editar neste dia':'Adicionar ao meu dia',`<form id="dayEventForm" class="form-grid">
      ${field('Nome',`<input id="deTitle" required maxlength="120" value="${esc(current?.title||'')}" placeholder="Ex.: Buscar encomenda">`,true)}
      ${field('Data',`<input id="deDate" type="date" required value="${key}">`)}
      ${field('Horário (opcional)',`<input id="deTime" type="time" value="${esc(current?.time||'')}">`)}
      ${field('Área',areaSelect(current?.area||'pessoal'),true)}
      ${field('Observação',`<textarea id="deNotes">${esc(current?.notes||'')}</textarea>`,true)}
      <div class="form-actions">${original?'<button type="button" class="secondary" id="deDelete">Excluir deste dia</button>':''}<button class="primary" type="submit">Salvar</button></div></form>`);
    el('dayEventForm').onsubmit=e=>{
      e.preventDefault();const date=el('deDate').value,title=el('deTitle').value.trim();if(!title||!date)return;
      const data={title,time:el('deTime').value,area:el('fArea').value,notes:el('deNotes').value.trim()};
      if(original){
        if(original.date==='*'){
          state.dayOverrides[key]??={};state.dayOverrides[key][id]={deleted:true};
          state.events.push({id:uid('event'),date,...data,kind:'event'});
        }else Object.assign(original,{...data,date});
      }else state.events.push({id:uid('event'),date,...data,kind:'event'});
      dayViewDate=date;save();closeModal();renderAll();toast('Meu Dia atualizado ✨');
    };
    if(original)el('deDelete').onclick=()=>{
      if(!confirm('Excluir este compromisso somente deste dia?'))return;
      if(original.date==='*'){state.dayOverrides[key]??={};state.dayOverrides[key][id]={deleted:true}}
      else state.events=state.events.filter(e=>e.id!==id);
      save();closeModal();renderAll();toast('Removido deste dia');
    };
  }

  function renderSmartPlan(){
    let budget=Number(state.preferences.availableMinutes||120);
    const candidates=state.tasks.filter(t=>!t.archived&&!t.completed).sort((a,b)=>smartScore(b)-smartScore(a));
    const picked=[];
    for(const t of candidates){
      const d=Number(t.duration||30);
      if(d<=budget || picked.length===0){ picked.push(t); budget-=d; }
      if(picked.length>=4 || budget<=0) break;
    }
    const container=el('smartPlan');
    if(!picked.length){ container.innerHTML='<div class="empty-state compact">Você não tem tarefas abertas. ✨</div>'; return; }
    container.innerHTML=picked.map((t,i)=>{
      const a=areaById(t.area); const urgency=t.due ? (t.due<todayKey()?'Atrasada':t.due===todayKey()?'Hoje':fmtDate(t.due)) : 'Sem prazo';
      return `<div class="plan-card"><div class="plan-index">${i+1}</div><div><b>${esc(t.title)}</b><small>${a.emoji} ${esc(a.name)} · ${minutesLabel(t.duration||30)} · ${urgency}</small></div></div>`;
    }).join('');
  }

  function sortTasks(list, mode){
    return [...list].sort((a,b)=>{
      if(mode==='priority') return priorityWeight(b.priority)-priorityWeight(a.priority);
      if(mode==='due') return (a.due||'9999-99-99').localeCompare(b.due||'9999-99-99');
      if(mode==='created') return String(b.createdAt||'').localeCompare(String(a.createdAt||''));
      return smartScore(b)-smartScore(a);
    });
  }

  function renderAreaOptions(){
    const options='<option value="all">Todas as áreas</option>'+state.areas.map(a=>`<option value="${esc(a.id)}">${a.emoji} ${esc(a.name)}</option>`).join('');
    const old=el('areaFilter').value||'all'; el('areaFilter').innerHTML=options; el('areaFilter').value=[...el('areaFilter').options].some(o=>o.value===old)?old:'all';
  }

  function renderTasks(){
    renderAreaOptions();
    let list=state.tasks.filter(t=> taskFilter==='arquivadas' ? t.archived : !t.archived);
    if(taskFilter==='hoje') list=list.filter(t=>t.due===todayKey()&&!t.completed);
    else if(taskFilter==='alta') list=list.filter(t=>t.priority==='alta'&&!t.completed);
    else if(taskFilter==='ativas') list=list.filter(t=>!t.completed);
    const area=el('areaFilter').value||'all'; if(area!=='all') list=list.filter(t=>t.area===area);
    list=sortTasks(list,el('sortTasks').value||'smart');
    el('taskList').innerHTML=list.length?list.map(taskHTML).join(''):'<div class="empty-state compact">Nenhuma tarefa aqui.</div>';
  }

  function taskHTML(t){
    const a=areaById(t.area); const overdue=t.due && t.due<todayKey() && !t.completed;
    const meta=[];
    if(t.priority==='alta') meta.push('<span class="tag high">Alta prioridade</span>');
    if(t.due) meta.push(`<span class="tag ${overdue?'high':''}">${overdue?'Atrasada · ':''}${fmtDate(t.due)}</span>`);
    if(t.time) meta.push(`<span class="tag">${esc(t.time)}</span>`);
    if(t.area && t.area!=='pessoal') meta.push(`<span class="task-area">${a.emoji} ${esc(a.name)}</span>`);
    return `<div class="task-card">
      <button class="check-btn ${t.completed?'done':''}" data-complete="${t.id}" aria-label="${t.completed?'Reabrir':'Concluir'}">${t.completed?'✓':''}</button>
      <div><div class="task-title ${t.completed?'completed':''}">${esc(t.title)}</div>${meta.length?`<div class="meta-row">${meta.join('')}</div>`:''}
      ${t.notes?`<div class="task-note">${esc(t.notes)}</div>`:''}</div>
      <button class="more-btn" data-edit-task="${t.id}">•••</button></div>`;
  }

  function renderCalendar(){
    el('calendarTitle').textContent=new Intl.DateTimeFormat('pt-BR',{month:'long',year:'numeric'}).format(calendarCursor);
    const y=calendarCursor.getFullYear(),m=calendarCursor.getMonth();
    const first=new Date(y,m,1), start=new Date(y,m,1-first.getDay());
    const cells=[];
    for(let i=0;i<42;i++){
      const d=new Date(start); d.setDate(start.getDate()+i); const key=dateKey(d);
      const eventCount=state.events.filter(e=>e.date===key).length, taskCount=state.tasks.filter(t=>!t.archived&&t.due===key).length, medCount=state.medicine.assessments.filter(a=>a.date===key).length;
      cells.push(`<button class="day-cell ${d.getMonth()!==m?'outside':''} ${key===todayKey()?'today':''} ${key===selectedDate?'selected':''}" data-date="${key}"><span class="day-number">${d.getDate()}</span><span class="dot-row">${eventCount||medCount?'<i class="cal-dot medicine"></i>':''}${taskCount?'<i class="cal-dot task"></i>':''}</span></button>`);
    }
    el('calendarGrid').innerHTML=cells.join('');
    el('selectedDateTitle').textContent=new Intl.DateTimeFormat('pt-BR',{weekday:'long',day:'numeric',month:'long'}).format(parseLocalDate(selectedDate));
    const items=[];
    state.events.filter(e=>e.date===selectedDate).forEach(e=>items.push({kind:'Evento',title:e.title,time:e.time,area:e.area}));
    state.tasks.filter(t=>!t.archived&&t.due===selectedDate).forEach(t=>items.push({kind:t.completed?'Tarefa concluída':'Tarefa',title:t.title,time:t.time,area:t.area}));
    state.medicine.assessments.filter(a=>a.date===selectedDate).forEach(a=>items.push({kind:a.type||'Avaliação',title:a.title,time:a.time,area:'medicina'}));
    items.sort((a,b)=>(a.time||'99:99').localeCompare(b.time||'99:99'));
    el('selectedDateItems').innerHTML=items.length?items.map(i=>`<div class="plan-card"><div class="plan-index">${i.time?esc(i.time):'•'}</div><div><b>${esc(i.title)}</b><small>${areaById(i.area).emoji} ${esc(i.kind)}</small></div></div>`).join(''):'<div class="empty-state compact">Nenhum item neste dia.</div>';
  }

  function renderProjects(){
    const projects=state.projects.filter(p=>!p.archived);
    el('projectList').innerHTML=projects.length?projects.map(p=>{
      const done=p.steps.filter(s=>s.done).length, total=p.steps.length, pct=total?Math.round(done/total*100):0;
      const current=p.steps.find(s=>!s.done);
      return `<div class="project-card"><div class="project-top"><div><span class="eyebrow">${areaById(p.area).emoji} ${esc(areaById(p.area).name)}</span><h3>${esc(p.title)}</h3><p>${esc(p.description||'')}</p></div><button class="more-btn" data-edit-project="${p.id}">•••</button></div><div class="project-progress"><div style="width:${pct}%"></div></div><p>${done}/${total} etapas · ${pct}%</p>${p.steps.map(s=>`<div class="project-step ${current&&current.id===s.id?'current':''}"><button class="check-btn ${s.done?'done':''}" data-project-step="${p.id}|${s.id}">${s.done?'✓':''}</button><span class="${s.done?'task-title completed':''}">${esc(s.title)}</span></div>`).join('')}<div class="project-actions"><button class="secondary" data-add-step="${p.id}">＋ Próxima ação</button></div></div>`;
    }).join(''):'<div class="empty-state compact">Nenhum projeto ativo.</div>';
  }

  function renderMedicine(){
    const upcoming=state.medicine.assessments.filter(a=>a.date>=todayKey()).sort((a,b)=>a.date.localeCompare(b.date));
    const dueReviews=state.medicine.reviews.filter(r=>!r.done && (!r.nextReview || r.nextReview<=todayKey())).length;
    el('medicineStats').innerHTML=`<div class="stat-card"><small>Próximas avaliações</small><b>${upcoming.length}</b></div><div class="stat-card"><small>Revisões devidas</small><b>${dueReviews}</b></div><div class="stat-card"><small>Tarefas de Medicina</small><b>${state.tasks.filter(t=>!t.archived&&!t.completed&&t.area==='medicina').length}</b></div>`;
    el('assessmentList').innerHTML=upcoming.length?upcoming.map(a=>{const days=assessmentDaysLeft(a.date);return `<div class="assessment-card"><div class="project-top"><div><h4>${esc(a.title)}</h4><div class="meta-row"><span class="tag">${esc(a.subject||'Medicina')}</span><span class="tag">${fmtDate(a.date,{day:'2-digit',month:'short',year:'numeric'})}${a.time?' · '+esc(a.time):''}</span></div></div><div class="days-left">${days===0?'Hoje':days===1?'1 dia':days+' dias'}</div></div></div>`}).join(''):'<div class="empty-state compact">Nenhuma prova ou trabalho cadastrado.</div>';
    const rev=[...state.medicine.reviews].sort((a,b)=>(a.nextReview||'9999').localeCompare(b.nextReview||'9999'));
    el('reviewList').innerHTML=rev.length?rev.map(r=>`<div class="review-card"><div class="project-top"><div><h4>${esc(r.topic)}</h4><div class="meta-row"><span class="tag">${esc(r.method||'Revisão')}</span>${r.nextReview?`<span class="tag">📅 ${fmtDate(r.nextReview)}</span>`:''}</div></div><button class="check-btn ${r.done?'done':''}" data-review-done="${r.id}">${r.done?'✓':''}</button></div></div>`).join(''):'<div class="empty-state compact">Nenhuma revisão cadastrada.</div>';
  }

  function renderHabits(){
    const checks=state.habitChecks[todayKey()]||{};
    el('habitToday').innerHTML=state.habits.length?state.habits.map(h=>`<div class="card habit-row"><button class="habit-check ${checks[h.id]?'done':''}" data-habit="${h.id}">${checks[h.id]?'✓':''}</button><div class="grow"><b>${esc(h.emoji||'🌱')} ${esc(h.title)}</b><small>${checks[h.id]?'Feito hoje':'Ainda não marcado'}</small></div><button class="more-btn" data-delete-habit="${h.id}">•••</button></div>`).join(''):'<div class="empty-state compact">Nenhum hábito cadastrado.</div>';
    const rows=[];
    for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const key=dateKey(d),c=state.habitChecks[key]||{},done=state.habits.filter(h=>c[h.id]).length,pct=state.habits.length?Math.round(done/state.habits.length*100):0;rows.push(`<div class="history-bar-row"><span>${new Intl.DateTimeFormat('pt-BR',{weekday:'short',day:'numeric'}).format(d)}</span><div class="history-bar"><div style="width:${pct}%"></div></div><b>${pct}%</b></div>`)}
    el('habitHistory').innerHTML=rows.join('');
  }

  function renderFinance(){
    const planned=state.finance.categories.reduce((s,c)=>s+Number(c.planned||0),0), balance=Number(state.finance.income||0)-planned;
    el('financeStats').innerHTML=`<div class="stat-card"><small>Disponível</small><b>${fmtMoney(state.finance.income)}</b></div><div class="stat-card"><small>Planejado</small><b>${fmtMoney(planned)}</b></div><div class="stat-card"><small>Saldo</small><b>${fmtMoney(balance)}</b></div>`;
    el('budgetList').innerHTML=`<div class="budget-row"><div class="grow"><b>Renda / disponível</b><small>Valor mensal de referência</small></div><input class="budget-input" data-income type="number" step="50" min="0" value="${Number(state.finance.income||0)}"></div>`+state.finance.categories.map(c=>`<div class="budget-row"><div class="grow"><b>${esc(c.name)}</b><small>Planejado no mês</small></div><input class="budget-input" data-budget="${c.id}" type="number" step="10" min="0" value="${Number(c.planned||0)}"><button class="more-btn" data-delete-budget="${c.id}">×</button></div>`).join('');
  }

  function switchView(view){
    currentView=view;
    document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.dataset.view===view));
    document.querySelectorAll('.bottom-nav button').forEach(b=>b.classList.toggle('active',b.dataset.nav===view));
    document.querySelectorAll('.subview').forEach(s=>s.classList.add('hidden'));
    document.querySelector('#view-mais > .feature-grid')?.classList.remove('hidden');
    document.querySelector('#view-mais > .page-title-row')?.classList.remove('hidden');
    window.scrollTo({top:0,behavior:'auto'});
    renderAll();
  }

  function openSubview(name){
    switchView('mais');
    document.querySelector('#view-mais > .feature-grid').classList.add('hidden');
    document.querySelector('#view-mais > .page-title-row').classList.add('hidden');
    document.querySelectorAll('.subview').forEach(s=>s.classList.toggle('hidden',s.id!==`subview-${name}`));
  }

  function openModal(title, html, afterOpen){
    el('modalTitle').textContent=title; el('modalBody').innerHTML=html; el('modalBackdrop').classList.remove('hidden');
    document.body.style.overflow='hidden'; if(afterOpen) afterOpen();
  }
  function closeModal(){ el('modalBackdrop').classList.add('hidden'); el('modalBody').innerHTML=''; document.body.style.overflow=''; }
  const field = (label, input, full=false) => `<div class="form-field ${full?'full':''}"><label>${label}</label>${input}</div>`;
  function areaSelect(value='pessoal'){ return `<select id="fArea">${state.areas.map(a=>`<option value="${a.id}" ${a.id===value?'selected':''}>${a.emoji} ${esc(a.name)}</option>`).join('')}</select>`; }

  function taskForm(task=null){
    const t=task||{title:'',area:'pessoal',priority:'media',due:'',time:'',duration:30,notes:'',reminder:0};
    const hasDate=Boolean(t.due), hasTime=Boolean(t.time);
    openModal(task?'Editar tarefa':'Nova tarefa',`<form id="taskForm" class="form-grid task-form-clean">
      ${field('Tarefa',`<div class="voice-row"><input id="fTitle" required maxlength="120" value="${esc(t.title)}" placeholder="O que você precisa fazer?"><button type="button" class="voice-btn" id="voiceBtn" aria-label="Ditado por voz">🎙️</button></div>`,true)}
      <div class="form-field full schedule-options">
        <label>Quando</label>
        <div class="optional-buttons">
          <button type="button" class="optional-toggle ${hasDate?'active':''}" id="toggleDate">📅 <span>${hasDate?'Com data':'Adicionar data'}</span></button>
          <button type="button" class="optional-toggle ${hasTime?'active':''}" id="toggleTime">🕒 <span>${hasTime?'Com horário':'Adicionar horário'}</span></button>
        </div>
      </div>
      <div class="form-field ${hasDate?'':'hidden'}" id="dateField"><label>Data</label><input id="fDue" type="date" value="${t.due||''}"></div>
      <div class="form-field ${hasTime?'':'hidden'}" id="timeField"><label>Horário</label><input id="fTime" type="time" value="${t.time||''}"></div>
      <div class="form-field ${hasDate&&hasTime?'':'hidden'}" id="reminderField"><label>Lembrete</label><select id="fReminder"><option value="0">Sem lembrete</option><option value="10" ${Number(t.reminder)===10?'selected':''}>10 min antes</option><option value="30" ${Number(t.reminder)===30?'selected':''}>30 min antes</option><option value="60" ${Number(t.reminder)===60?'selected':''}>1 h antes</option></select></div>
      <details class="task-more full" ${task && (t.area!=='pessoal'||t.priority!=='media'||Number(t.duration)!==30||t.notes) ? 'open' : ''}>
        <summary>Mais opções</summary>
        <div class="task-more-grid">
          ${field('Área',areaSelect(t.area))}${field('Prioridade',`<select id="fPriority"><option value="alta" ${t.priority==='alta'?'selected':''}>Alta</option><option value="media" ${t.priority==='media'?'selected':''}>Média</option><option value="baixa" ${t.priority==='baixa'?'selected':''}>Baixa</option></select>`)}
          ${field('Duração',`<select id="fDuration">${[10,15,20,30,45,60,90,120,180].map(n=>`<option value="${n}" ${Number(t.duration)===n?'selected':''}>${minutesLabel(n)}</option>`).join('')}</select>`)}
          ${field('Observações',`<textarea id="fNotes" placeholder="Opcional">${esc(t.notes||'')}</textarea>`,true)}
        </div>
      </details>
      <div class="form-actions">${task?'<button type="button" class="secondary" id="archiveTask">Arquivar</button>':''}<button type="submit" class="primary">Salvar</button></div>
    </form>`,()=>{
      setupVoice('fTitle','voiceBtn');
      const dateField=el('dateField'), timeField=el('timeField'), reminderField=el('reminderField');
      const syncSchedule=()=>{
        const dateOn=!dateField.classList.contains('hidden'), timeOn=!timeField.classList.contains('hidden');
        el('toggleDate').classList.toggle('active',dateOn);
        el('toggleTime').classList.toggle('active',timeOn);
        el('toggleDate').querySelector('span').textContent=dateOn?'Com data':'Adicionar data';
        el('toggleTime').querySelector('span').textContent=timeOn?'Com horário':'Adicionar horário';
        reminderField.classList.toggle('hidden',!(dateOn&&timeOn));
        if(!(dateOn&&timeOn)) el('fReminder').value='0';
      };
      el('toggleDate').onclick=()=>{const turningOn=dateField.classList.contains('hidden');dateField.classList.toggle('hidden',!turningOn);if(turningOn&&!el('fDue').value)el('fDue').value=todayKey();else if(!turningOn)el('fDue').value='';syncSchedule()};
      el('toggleTime').onclick=()=>{const turningOn=timeField.classList.contains('hidden');timeField.classList.toggle('hidden',!turningOn);if(!turningOn)el('fTime').value='';syncSchedule()};
      syncSchedule();
    });
    el('taskForm').onsubmit=e=>{e.preventDefault();const data={title:el('fTitle').value.trim(),area:el('fArea').value,priority:el('fPriority').value,due:el('dateField').classList.contains('hidden')?'':el('fDue').value,time:el('timeField').classList.contains('hidden')?'':el('fTime').value,duration:Number(el('fDuration').value),reminder:el('reminderField').classList.contains('hidden')?0:Number(el('fReminder').value),notes:el('fNotes').value.trim()};if(!data.title)return;if(task){Object.assign(task,data)}else state.tasks.push({id:uid('task'),...data,completed:false,archived:false,createdAt:new Date().toISOString()});save();closeModal();renderAll();toast(task?'Tarefa atualizada':'Tarefa adicionada ✨')};
    if(task) el('archiveTask').onclick=()=>{task.archived=true;if(state.preferences.mainPriorityId===task.id)state.preferences.mainPriorityId=null;save();closeModal();renderAll();toast('Tarefa arquivada')};
  }

  function eventForm(){
    openModal('Novo compromisso',`<form id="eventForm" class="form-grid">${field('Nome',`<input id="eTitle" required maxlength="120" placeholder="Ex.: consulta, aula, academia">`,true)}${field('Data',`<input id="eDate" type="date" required value="${selectedDate||todayKey()}">`)}${field('Horário',`<input id="eTime" type="time" required>`)}${field('Área',areaSelect('pessoal'),true)}${field('Observação',`<textarea id="eNotes" placeholder="Opcional"></textarea>`,true)}<div class="form-actions"><button class="primary" type="submit">Adicionar</button></div></form>`);
    el('eventForm').onsubmit=e=>{e.preventDefault();state.events.push({id:uid('event'),title:el('eTitle').value.trim(),date:el('eDate').value,time:el('eTime').value,area:el('fArea').value,notes:el('eNotes').value.trim(),kind:'event'});save();closeModal();renderAll();toast('Compromisso adicionado')};
  }

  function pickPriority(){
    const list=state.tasks.filter(t=>!t.archived&&!t.completed).sort((a,b)=>smartScore(b)-smartScore(a));
    openModal('Escolha uma tarefa',list.length?`<div class="stack">${list.map(t=>`<button class="plan-card" style="width:100%;text-align:left" data-pick="${t.id}"><div class="plan-index">${areaById(t.area).emoji}</div><div><b>${esc(t.title)}</b><small>${t.due?fmtDate(t.due):'Sem prazo'} · ${minutesLabel(t.duration||30)}</small></div></button>`).join('')}</div>`:'<div class="empty-state compact">Crie uma tarefa primeiro.</div>');
  }

  function projectForm(project=null){
    const p=project||{title:'',area:'projetos',description:'',steps:[]};
    openModal(project?'Editar projeto':'Novo projeto',`<form id="projectForm" class="form-grid">${field('Projeto',`<input id="pTitle" required value="${esc(p.title)}" placeholder="Ex.: organizar viagem">`,true)}${field('Área',areaSelect(p.area),true)}${field('Descrição',`<textarea id="pDesc" placeholder="Resultado que você quer alcançar">${esc(p.description||'')}</textarea>`,true)}<div class="form-actions">${project?'<button type="button" class="secondary" id="archiveProject">Arquivar</button>':''}<button class="primary" type="submit">Salvar</button></div></form>`);
    el('projectForm').onsubmit=e=>{e.preventDefault();const data={title:el('pTitle').value.trim(),area:el('fArea').value,description:el('pDesc').value.trim()};if(project)Object.assign(project,data);else state.projects.push({id:uid('proj'),...data,archived:false,steps:[]});save();closeModal();renderAll()};
    if(project)el('archiveProject').onclick=()=>{project.archived=true;save();closeModal();renderAll();toast('Projeto arquivado')};
  }

  function addProjectStep(projectId){
    const p=state.projects.find(x=>x.id===projectId); if(!p)return;
    openModal('Próxima ação',`<form id="stepForm" class="form-grid">${field('Ação pequena e concreta',`<input id="sTitle" required autofocus placeholder="Ex.: separar documentos">`,true)}<div class="form-actions"><button class="primary">Adicionar</button></div></form>`);
    el('stepForm').onsubmit=e=>{e.preventDefault();p.steps.push({id:uid('step'),title:el('sTitle').value.trim(),done:false});save();closeModal();renderAll()};
  }

  function assessmentForm(){
    openModal('Prova ou trabalho',`<form id="assessmentForm" class="form-grid">${field('Nome',`<input id="aTitle" required placeholder="Ex.: Prova de Cardiologia">`,true)}${field('Disciplina / tema',`<input id="aSubject" placeholder="Ex.: Habilidades Médicas">`)}${field('Tipo',`<select id="aType"><option>Prova</option><option>Trabalho</option><option>OSCE</option><option>Tutoria</option><option>Outro</option></select>`)}${field('Data',`<input id="aDate" type="date" required>`)}${field('Horário',`<input id="aTime" type="time">`)}${field('Observações',`<textarea id="aNotes"></textarea>`,true)}<div class="form-actions"><button class="primary">Salvar</button></div></form>`);
    el('assessmentForm').onsubmit=e=>{e.preventDefault();state.medicine.assessments.push({id:uid('assessment'),title:el('aTitle').value.trim(),subject:el('aSubject').value.trim(),type:el('aType').value,date:el('aDate').value,time:el('aTime').value,notes:el('aNotes').value.trim()});save();closeModal();renderAll();toast('Avaliação cadastrada')};
  }

  function reviewForm(){
    openModal('Nova revisão',`<form id="reviewForm" class="form-grid">${field('Tema',`<input id="rTopic" required placeholder="Ex.: taquiarritmias">`,true)}${field('Método',`<select id="rMethod"><option>Flashcards</option><option>Questões</option><option>Resumo</option><option>Revisão oral</option></select>`)}${field('Próxima revisão',`<input id="rDate" type="date" value="${todayKey()}">`)}<div class="form-actions"><button class="primary">Adicionar</button></div></form>`);
    el('reviewForm').onsubmit=e=>{e.preventDefault();state.medicine.reviews.push({id:uid('review'),topic:el('rTopic').value.trim(),method:el('rMethod').value,nextReview:el('rDate').value,done:false});save();closeModal();renderAll()};
  }

  function addHabit(){
    openModal('Novo hábito',`<form id="habitForm" class="form-grid">${field('Hábito',`<input id="hTitle" required placeholder="Ex.: leitura · 20 min">`,true)}${field('Emoji',`<input id="hEmoji" maxlength="4" value="🌱">`,true)}<div class="form-actions"><button class="primary">Adicionar</button></div></form>`);
    el('habitForm').onsubmit=e=>{e.preventDefault();state.habits.push({id:uid('habit'),title:el('hTitle').value.trim(),emoji:el('hEmoji').value.trim()||'🌱'});save();closeModal();renderAll()};
  }

  function addBudget(){
    openModal('Nova categoria',`<form id="budgetForm" class="form-grid">${field('Categoria',`<input id="bName" required placeholder="Ex.: academia">`,true)}${field('Valor mensal',`<input id="bValue" type="number" min="0" step="10" value="0">`,true)}<div class="form-actions"><button class="primary">Adicionar</button></div></form>`);
    el('budgetForm').onsubmit=e=>{e.preventDefault();state.finance.categories.push({id:uid('budget'),name:el('bName').value.trim(),planned:Number(el('bValue').value||0)});save();closeModal();renderAll()};
  }

  function setupVoice(inputId,buttonId){
    const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
    const btn=el(buttonId); if(!btn)return;
    if(!SpeechRecognition){btn.style.opacity=.45;btn.title='Ditado não disponível neste navegador';return;}
    btn.onclick=()=>{const rec=new SpeechRecognition();rec.lang='pt-BR';rec.interimResults=false;rec.maxAlternatives=1;btn.classList.add('listening');btn.textContent='●';rec.onresult=e=>{const text=e.results[0][0].transcript;el(inputId).value=(el(inputId).value+' '+text).trim()};rec.onerror=()=>toast('Não consegui ouvir. Você pode digitar normalmente.');rec.onend=()=>{btn.classList.remove('listening');btn.textContent='🎙️'};rec.start()};
  }

  function toggleTask(id){
    const t=state.tasks.find(x=>x.id===id);if(!t)return;t.completed=!t.completed;
    if(t.completed){setTimeout(()=>{t.archived=true;save();renderAll();},450);if(state.preferences.mainPriorityId===id)state.preferences.mainPriorityId=null;toast('Concluída ✨')}
    save();renderAll();
  }

  function studySuggestion(minutes){
    const assessments=state.medicine.assessments.filter(a=>a.date>=todayKey()).sort((a,b)=>a.date.localeCompare(b.date));
    const reviews=state.medicine.reviews.filter(r=>!r.done && (!r.nextReview || r.nextReview<=todayKey()));
    const medTasks=state.tasks.filter(t=>!t.archived&&!t.completed&&t.area==='medicina').sort((a,b)=>smartScore(b)-smartScore(a));
    const parts=[]; let left=minutes;
    if(assessments[0]&&left>=20){const use=Math.min(left>=60?35:Math.max(15,left),45);parts.push(`${use} min · foco em <b>${esc(assessments[0].subject||assessments[0].title)}</b> para ${esc(assessments[0].title)}`);left-=use}
    if(reviews[0]&&left>=10){const use=Math.min(20,left);parts.push(`${use} min · ${esc(reviews[0].method||'revisão')} de <b>${esc(reviews[0].topic)}</b>`);left-=use}
    if(medTasks[0]&&left>=10){parts.push(`${left} min · avançar na tarefa <b>${esc(medTasks[0].title)}</b>`);left=0}
    if(!parts.length) parts.push(`Use os ${minutes} min para revisar o conteúdo mais recente da faculdade ou cadastrar sua próxima prova/revisão.`);
    el('studySuggestion').innerHTML=parts.join('<br><br>');
  }

  async function askNotifications(){
    if(!('Notification' in window)){toast('Seu navegador não oferece notificações web.');return}
    if(Notification.permission==='granted'){toast('Lembretes já estão autorizados 🔔');return}
    const p=await Notification.requestPermission();state.preferences.notificationsAsked=true;save();toast(p==='granted'?'Lembretes ativados':'Permissão de notificação não concedida');
  }

  function notificationSweep(){
    if(!('Notification' in window)||Notification.permission!=='granted')return;
    const now=new Date(), key=todayKey(), current=nowMinutes();
    const notify=(id,title,body)=>{
      const logKey=`${key}|${id}`;if(state.notificationLog[logKey])return;state.notificationLog[logKey]=Date.now();save();
      try{navigator.serviceWorker?.ready.then(reg=>reg.showNotification(title,{body,icon:'icons/icon-192.png',badge:'icons/icon-192.png',tag:id})).catch(()=>new Notification(title,{body}))}catch{}
    };
    eventsForDate(key).forEach(e=>{if(!e.time)return;const [h,m]=e.time.split(':').map(Number),at=h*60+m;if(current>=at-2&&current<=at+2)notify(e.id,e.title,`Agora · ${e.time}`)});
    state.tasks.filter(t=>!t.completed&&!t.archived&&t.due===key&&t.time&&Number(t.reminder)>0).forEach(t=>{const[h,m]=t.time.split(':').map(Number),at=h*60+m-Number(t.reminder);if(current>=at-2&&current<=at+2)notify(t.id,t.title,`Em ${t.reminder} min · ${t.time}`)});
  }

  function exportJSON(){
    downloadBlob(JSON.stringify(state,null,2),'diva-backup.json','application/json'); toast('Backup exportado');
  }
  function downloadBlob(content,name,type){const blob=new Blob([content],{type}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
  function exportICS(){
    const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//DIVA//PT-BR','CALSCALE:GREGORIAN'];
    const clean=s=>String(s||'').replace(/([,;\\])/g,'\\$1').replace(/\n/g,'\\n');
    const add=(uidv,title,date,time='09:00',desc='')=>{const [y,m,d]=date.split('-');const [hh,mm]=time.split(':');lines.push('BEGIN:VEVENT',`UID:${uidv}@diva`,`DTSTART:${y}${m}${d}T${hh}${mm}00`,`DTEND:${y}${m}${d}T${pad(Number(hh)+(Number(mm)+30>=60?1:0))}${pad((Number(mm)+30)%60)}00`,`SUMMARY:${clean(title)}`,`DESCRIPTION:${clean(desc)}`,'END:VEVENT')};
    state.events.filter(e=>e.date!=='*').forEach(e=>add(e.id,e.title,e.date,e.time||'09:00',e.notes||''));
    state.tasks.filter(t=>!t.archived&&t.due).forEach(t=>add(t.id,t.title,t.due,t.time||'09:00',t.notes||''));
    state.medicine.assessments.forEach(a=>add(a.id,a.title,a.date,a.time||'09:00',a.subject||''));
    lines.push('END:VCALENDAR');downloadBlob(lines.join('\r\n'),'diva-calendario.ics','text/calendar;charset=utf-8');
  }

  function bindEvents(){
    document.querySelectorAll('.bottom-nav button').forEach(b=>b.onclick=()=>switchView(b.dataset.nav));
    document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>switchView(b.dataset.go));
    document.querySelectorAll('[data-subview]').forEach(b=>b.onclick=()=>openSubview(b.dataset.subview));
    document.querySelectorAll('.back-btn').forEach(b=>b.onclick=()=>{document.querySelectorAll('.subview').forEach(s=>s.classList.add('hidden'));document.querySelector('#view-mais > .feature-grid').classList.remove('hidden');document.querySelector('#view-mais > .page-title-row').classList.remove('hidden')});
    document.querySelectorAll('[data-open-add]').forEach(b=>b.onclick=()=>b.dataset.openAdd==='event'?eventForm():taskForm());
    el('fab').onclick=()=>taskForm(); el('closeModal').onclick=closeModal; el('modalBackdrop').addEventListener('click',e=>{if(e.target===el('modalBackdrop'))closeModal()});
    el('notificationBtn').onclick=askNotifications;
    el('energySwitch').addEventListener('click',e=>{const b=e.target.closest('[data-energy]');if(!b)return;state.preferences.energy=b.dataset.energy;save();renderToday()});
    el('pickPriorityBtn').onclick=pickPriority;
    el('dayDate').onchange=e=>{if(e.target.value){dayViewDate=e.target.value;renderDayTimeline()}};
    el('dayPrev').onclick=()=>{const d=parseLocalDate(dayViewDate);d.setDate(d.getDate()-1);dayViewDate=dateKey(d);renderDayTimeline()};
    el('dayNext').onclick=()=>{const d=parseLocalDate(dayViewDate);d.setDate(d.getDate()+1);dayViewDate=dateKey(d);renderDayTimeline()};
    el('dayAdd').onclick=()=>dayEventForm();
    el('taskFilters').onclick=e=>{const b=e.target.closest('[data-filter]');if(!b)return;taskFilter=b.dataset.filter;document.querySelectorAll('#taskFilters .chip').forEach(x=>x.classList.toggle('active',x===b));renderTasks()};
    el('areaFilter').onchange=renderTasks; el('sortTasks').onchange=renderTasks;
    el('prevMonth').onclick=()=>{calendarCursor.setMonth(calendarCursor.getMonth()-1);renderCalendar()}; el('nextMonth').onclick=()=>{calendarCursor.setMonth(calendarCursor.getMonth()+1);renderCalendar()};
    el('calendarGrid').addEventListener('click',e=>{const b=e.target.closest('[data-date]');if(!b)return;selectedDate=b.dataset.date;renderCalendar()});
    el('newProjectBtn').onclick=()=>projectForm(); el('addAssessmentBtn').onclick=assessmentForm; el('addReviewBtn').onclick=reviewForm; el('addHabitBtn').onclick=addHabit; el('addBudgetBtn').onclick=addBudget;
    el('studyTimeButtons').onclick=e=>{const b=e.target.closest('[data-min]');if(!b)return;document.querySelectorAll('#studyTimeButtons button').forEach(x=>x.classList.toggle('active',x===b));studySuggestion(Number(b.dataset.min))};
    el('exportBtn').onclick=exportJSON; el('importBtn').onclick=()=>el('backupFile').click(); el('calendarExportBtn').onclick=exportICS;
    el('backupFile').onchange=async e=>{const f=e.target.files?.[0];if(!f)return;try{const obj=JSON.parse(await f.text());if(!obj||!Array.isArray(obj.tasks)||!Array.isArray(obj.events))throw new Error();if(confirm('Substituir os dados atuais por este backup?')){state=mergeDefaults(obj);save();renderAll();toast('Backup restaurado')}}catch{alert('Este arquivo não parece ser um backup válido do DIVA.')}e.target.value=''};
    el('resetBtn').onclick=()=>{if(confirm('Apagar todos os dados do DIVA e voltar ao estado inicial?')){state=deepClone(defaults);save();renderAll();toast('Dados reiniciados')}};
    el('installBtn').onclick=async()=>{if(deferredInstallPrompt){deferredInstallPrompt.prompt();await deferredInstallPrompt.userChoice;deferredInstallPrompt=null;el('installBtn').classList.add('hidden')}else toast('No iPhone: Compartilhar → Adicionar à Tela de Início')};

    document.addEventListener('click',e=>{
      const dc=e.target.closest('[data-day-check]');
      if(dc){const [source,id]=dc.dataset.dayCheck.split('|');if(source==='task'){const t=state.tasks.find(t=>t.id===id);if(t)t.completed=!t.completed}else{state.dayChecks[dayViewDate]??={};state.dayChecks[dayViewDate][id]=!state.dayChecks[dayViewDate][id]}save();renderAll();return}
      const de=e.target.closest('[data-day-edit]');if(de){dayEventForm(de.dataset.dayEdit);return}
      const complete=e.target.closest('[data-complete]');if(complete){toggleTask(complete.dataset.complete);return}
      const edit=e.target.closest('[data-edit-task]');if(edit){const t=state.tasks.find(x=>x.id===edit.dataset.editTask);if(t)taskForm(t);return}
      const pick=e.target.closest('[data-pick]');if(pick){state.preferences.mainPriorityId=pick.dataset.pick;save();closeModal();renderToday();return}
      const pstep=e.target.closest('[data-project-step]');if(pstep){const[pId,sId]=pstep.dataset.projectStep.split('|'),p=state.projects.find(x=>x.id===pId),s=p?.steps.find(x=>x.id===sId);if(s){s.done=!s.done;save();renderProjects()}return}
      const addStep=e.target.closest('[data-add-step]');if(addStep){addProjectStep(addStep.dataset.addStep);return}
      const editP=e.target.closest('[data-edit-project]');if(editP){const p=state.projects.find(x=>x.id===editP.dataset.editProject);if(p)projectForm(p);return}
      const rdone=e.target.closest('[data-review-done]');if(rdone){const r=state.medicine.reviews.find(x=>x.id===rdone.dataset.reviewDone);if(r){r.done=!r.done;save();renderMedicine()}return}
      const habit=e.target.closest('[data-habit]');if(habit){const key=todayKey();state.habitChecks[key]??={};state.habitChecks[key][habit.dataset.habit]=!state.habitChecks[key][habit.dataset.habit];save();renderHabits();renderToday();return}
      const dh=e.target.closest('[data-delete-habit]');if(dh&&confirm('Remover este hábito?')){state.habits=state.habits.filter(h=>h.id!==dh.dataset.deleteHabit);save();renderHabits();return}
      const db=e.target.closest('[data-delete-budget]');if(db&&confirm('Remover esta categoria?')){state.finance.categories=state.finance.categories.filter(c=>c.id!==db.dataset.deleteBudget);save();renderFinance();return}
    });
    el('budgetList').addEventListener('change',e=>{if(e.target.matches('[data-income]'))state.finance.income=Number(e.target.value||0);else if(e.target.matches('[data-budget]')){const c=state.finance.categories.find(x=>x.id===e.target.dataset.budget);if(c)c.planned=Number(e.target.value||0)}else return;save();renderFinance()});
    window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstallPrompt=e;el('installBtn').classList.remove('hidden')});
  }

  if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));}
  bindEvents(); renderAll(); notificationSweep(); setInterval(notificationSweep,60000);
})();
