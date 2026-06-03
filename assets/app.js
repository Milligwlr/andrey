// app.js — interacciones (sin dependencias). Modales accesibles + nav + hero reveal.
document.documentElement.classList.remove('no-js');
(function(){
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var lastFocus = null;

  // Hero reveal (LCP-safe)
  var h1 = document.querySelector('.hero h1');
  if(h1){
    if(reduce){ h1.style.opacity=1; h1.style.transform='none'; }
    else { requestAnimationFrame(function(){
      h1.style.transition='opacity .6s var(--ease-out-expo), transform .6s var(--ease-out-expo)';
      h1.style.opacity=1; h1.style.transform='none';
    }); }
  }
  // Nav móvil
  var nav=document.querySelector('.nav'), tog=document.querySelector('.nav-toggle');
  if(tog&&nav){
    tog.addEventListener('click',function(){
      var o=nav.getAttribute('data-open')==='true';
      nav.setAttribute('data-open',String(!o)); tog.setAttribute('aria-expanded',String(!o));
    });
    nav.querySelectorAll('.nav-links a').forEach(function(a){a.addEventListener('click',function(){nav.setAttribute('data-open','false');tog.setAttribute('aria-expanded','false');});});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&nav.getAttribute('data-open')==='true'){nav.setAttribute('data-open','false');tog.setAttribute('aria-expanded','false');tog.focus();}});
    document.addEventListener('click',function(e){if(nav.getAttribute('data-open')==='true'&&!e.target.closest('.nav')){nav.setAttribute('data-open','false');tog.setAttribute('aria-expanded','false');}});
  }
  var y=document.querySelector('[data-year]'); if(y) y.textContent=new Date().getFullYear();
  // Reveal universal (fallback para navegadores sin animation-timeline)
  try{
    if(!reduce && !(window.CSS&&CSS.supports&&CSS.supports('animation-timeline: view()'))){
      var rev=document.querySelectorAll('.reveal');
      if('IntersectionObserver' in window){
        var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){var t=en.target;t.style.transition='opacity .6s var(--ease-out-expo), transform .6s var(--ease-out-expo)';t.style.opacity=1;t.style.transform='none';io.unobserve(t);}});},{threshold:.12});
        rev.forEach(function(el,i){el.style.opacity=0;el.style.transform='translateY(24px)';el.style.transitionDelay=((i%3)*60)+'ms';io.observe(el);});
      }
    }
  }catch(e){}

  // Filtros de padecimientos
  var fb=document.querySelector('.filterbar');
  if(fb){
    var pgrid=document.querySelector('.pgrid');
    var pcards=document.querySelectorAll('.pgrid .pcard');
    function applyFilter(f){
      pcards.forEach(function(c){ c.classList.toggle('is-hidden', !(f==='all'||c.getAttribute('data-cat')===f)); });
      // #2: vista compacta cuando se ve "Todas" (rejilla muy extensa)
      if(pgrid) pgrid.classList.toggle('is-all', f==='all');
    }
    fb.addEventListener('click',function(e){
      var b=e.target.closest('.fbtn'); if(!b) return;
      fb.querySelectorAll('.fbtn').forEach(function(x){x.classList.remove('is-active');x.setAttribute('aria-selected','false');});
      b.classList.add('is-active'); b.setAttribute('aria-selected','true');
      applyFilter(b.getAttribute('data-filter'));
    });
    // estado inicial (si "Todas" arranca activo, compacta de entrada)
    var act=fb.querySelector('.fbtn.is-active');
    applyFilter(act?act.getAttribute('data-filter'):'all');
  }


  // Atribución Ads: propagar gclid a enlaces de WhatsApp
  try{
    var gclid=new URLSearchParams(location.search).get('gclid');
    if(gclid){
      document.querySelectorAll('a[href*="wa.me"]').forEach(function(a){
        a.href += (a.href.indexOf('?')>-1?'&':'?')+'gclid='+encodeURIComponent(gclid);
      });
    }
  }catch(e){}

  // ---- Modales ----
  function openModal(m){
    lastFocus=document.activeElement;
    m.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden';
    var f=m.querySelector('button,a[href],[tabindex]'); if(f) f.focus();
    document.addEventListener('keydown',esc);
  }
  function closeModal(m){
    m.setAttribute('aria-hidden','true'); document.body.style.overflow='';
    document.removeEventListener('keydown',esc);
    if(lastFocus&&lastFocus.focus) lastFocus.focus();
  }
  function esc(e){ if(e.key==='Escape'){document.querySelectorAll('.modal[aria-hidden="false"]').forEach(closeModal);} }

  var agenda=document.getElementById('modal-agenda');
  var detail=document.getElementById('modal-detail');

  // backdrops + close buttons
  document.querySelectorAll('.modal').forEach(function(m){
    m.querySelectorAll('[data-close]').forEach(function(b){b.addEventListener('click',function(){closeModal(m);});});
  });

  // Abrir agenda desde cualquier .js-agendar
  document.addEventListener('click',function(e){
    var a=e.target.closest('.js-agendar');
    if(a){ e.preventDefault();
      document.querySelectorAll('.modal[aria-hidden="false"]').forEach(function(m){ if(m!==agenda){ m.setAttribute('aria-hidden','true'); } });
      if(agenda) openModal(agenda); return; }
    var c=e.target.closest('[data-detail]');
    if(c && detail){
      e.preventDefault();
      var src=document.getElementById('detail-'+c.getAttribute('data-detail'));
      var body=detail.querySelector('.modal__body');
      if(src&&body){ body.innerHTML=src.innerHTML; openModal(detail); }
    }
  });

  // ---- B6: icono distintivo por padecimiento (mejora progresiva) ----
  // Los SVG inline del HTML quedan como fallback sin-JS; aquí se sustituyen
  // por un set coherente (Lucide, trazo 1.7) para que cada tarjeta se distinga.
  var ICONS={
    'enfermedades-pulmonares-intersticiales':'<path d="M12 4v8"/><path d="M9 8.5C9 6 7 5 5.5 6.5 3.8 8.2 4 12 4 15a3 3 0 0 0 5 2.2"/><path d="M15 8.5C15 6 17 5 18.5 6.5 20.2 8.2 20 12 20 15a3 3 0 0 1-5 2.2"/>',
    'fibrosis-pulmonar':'<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M7 10h10M7 14h7"/>',
    'enfermedades-autoinmunes-pulmon':'<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    'epoc':'<path d="M12.8 19.6A2 2 0 1 0 14 16H2"/><path d="M17.5 8a2.5 2.5 0 1 1 2 4H2"/><path d="M9.8 4.4A2 2 0 1 1 11 8H2"/>',
    'asma':'<path d="M6 12H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 8h12"/><path d="M18.3 19.3a3 3 0 1 0-3.6 0"/>',
    'bronquiectasias':'<line x1="6" x2="6" y1="3" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>',
    'tos-cronica':'<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    'apnea-del-sueno':'<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    'derrame-pleural':'<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
    'neumotorax':'<path d="M2.586 16.726A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2h6.624a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586z"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
    'hipertension-pulmonar':'<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>',
    'embolia-pulmonar':'<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    'neumonia':'<path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/>',
    'secuelas-covid':'<path d="M11 2v2M5 2v2M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1"/><path d="M8 15a6 6 0 0 0 12 0v-3"/><circle cx="20" cy="10" r="2"/>',
    'cancer-pulmon':'<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3"/><path d="m16 16-1.3-1.3"/>',
    'tabaquismo':'<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>'
  };
  document.querySelectorAll('.pcard[data-detail]').forEach(function(card){
    var ic=ICONS[card.getAttribute('data-detail')];
    var svg=card.querySelector('.pcard__i svg');
    if(ic&&svg){ svg.innerHTML=ic; }
  });

  // ---- B5: barra CTA inferior fija en móvil (Agendar + WhatsApp) ----
  // Sustituye al FAB redondo bajo 560px (el CSS oculta .fab y muestra .mcta).
  if(!document.querySelector('.mcta')){
    var wa=(document.querySelector('a[href*="wa.me"]')||{}).href||'https://wa.me/525632318496';
    var bar=document.createElement('div');
    bar.className='mcta';
    bar.innerHTML=''
      +'<button class="btn btn-primary js-agendar" type="button" data-cta="agendar_mcta">'
      +'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>Agendar</button>'
      +'<a class="btn btn-wa" href="'+wa+'" target="_blank" rel="noopener" data-cta="whatsapp_mcta">'
      +'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 0 1 8.413 3.488 11.82 11.82 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-1.207zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/></svg>WhatsApp</a>';
    document.body.appendChild(bar);
  }
})();
