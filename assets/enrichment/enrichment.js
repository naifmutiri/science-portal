/* Isolated, additive controls. Original presentation navigation is untouched. */
(function () {
  'use strict';
  const dataElement = document.querySelector('script[data-science-plus]');
  if (!dataElement) return;
  let lesson;
  try { lesson = JSON.parse(dataElement.textContent); } catch { return; }
  const slides = document.querySelectorAll('.science-plus');
  const labSlide = document.querySelector('.science-plus[data-enrichment="lab"]');
  const diagramSlide = document.querySelector('.science-plus[data-enrichment="diagram"]');
  const arabic = value => String(value).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);

  // Events belonging to the new controls must not turn the original slides.
  slides.forEach(slide => {
    slide.addEventListener('keydown', event => {
      if (event.target.closest('button,input,select,summary,a') && [' ','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End','PageUp','PageDown'].includes(event.key)) event.stopPropagation();
    });
    ['touchstart','touchend','wheel'].forEach(type => slide.addEventListener(type,event => {
      if (event.target.closest('button,input,select,summary,a,.se-sources,.se-facts,.se-controls,.se-result')) event.stopPropagation();
    },{passive:true}));
  });

  if (diagramSlide) {
    const buttons = diagramSlide.querySelectorAll('[data-node]');
    buttons.forEach(button => button.addEventListener('click', () => {
      const node = lesson.diagram.nodes[Number(button.dataset.node)];
      buttons.forEach(b => b.setAttribute('aria-pressed',String(b===button)));
      diagramSlide.querySelector('[data-detail-icon]').textContent=node.emoji;
      diagramSlide.querySelector('[data-detail-title]').textContent=node.label;
      diagramSlide.querySelector('[data-detail-text]').textContent=node.detail;
    }));
  }

  if (labSlide) {
    const config=lesson.lab;
    const buttons=[...labSlide.querySelectorAll('[data-choice]')];
    let selected=0;
    let previous=null;
    const observations=new Map();
    const model=labSlide.querySelector('[data-model]');
    const resultLabel=labSlide.querySelector('[data-state-name]');
    const observation=labSlide.querySelector('[data-observation]');
    const explanation=labSlide.querySelector('[data-explanation]');
    const log=labSlide.querySelector('[data-log]');
    function choose(index){
      selected=index;
      buttons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===selected)));
    }
    function render(index,isReset=false){
      const state=config.states[index];
      const amount=Math.max(0,Math.min(10,Number(state.amount)));
      model.replaceChildren();
      const growingPlant=/حجم النبتة/.test(config.quantityLabel);
      model.dataset.visual=growingPlant?'growth':'quantity';
      for(let i=0;i<(growingPlant?1:10);i++){
        const symbol=document.createElement('span');
        symbol.className='se-symbol'+(i<amount?' se-active':'');
        symbol.textContent=state.emoji;
        if(growingPlant)symbol.style.fontSize=(50+amount*6)+'px';
        symbol.setAttribute('aria-hidden','true');
        model.append(symbol);
      }
      model.setAttribute('aria-label',config.quantityLabel+' — '+state.label+'؛ مؤشر بصري وصفي، وليس قياسًا فعليًا.');
      resultLabel.textContent=state.label;
      observation.textContent=state.observation;
      explanation.textContent=state.explanation;
      if(isReset){observations.clear();previous=null;log.textContent='توقّع النتيجة، ثم غيّر الحالة وشغّل المحاكاة.';}
      else{
        observations.set(index,state.label);
        const contrast=previous!==null && previous!==index?' قارنها بالحالة السابقة: '+config.states[previous].label+'.':'';
        log.textContent='حالات جُرّبت: '+arabic(observations.size)+' من '+arabic(config.states.length)+'.'+contrast;
        previous=index;
      }
      labSlide.dataset.appliedState=String(index);
    }
    buttons.forEach((button,index)=>button.addEventListener('click',()=>choose(index)));
    labSlide.querySelector('[data-run]').addEventListener('click',()=>render(selected));
    labSlide.querySelector('[data-reset]').addEventListener('click',()=>{choose(0);render(0,true);});
    choose(0);render(0,true);
  }

  const zoom=document.querySelector('[data-photo-zoom]');
  if(zoom){
    const dialog=document.createElement('dialog');
    dialog.className='se-photo-dialog';
    dialog.dir='rtl';
    dialog.setAttribute('aria-label','الصورة التعليمية مكبّرة');
    const close=document.createElement('button');close.type='button';close.textContent='إغلاق الصورة ✕';
    const photo=document.createElement('img');
    const original=document.querySelector('.science-plus .se-photo');
    photo.src=original.src;photo.alt=original.alt;
    const caption=document.createElement('p');caption.textContent=original.alt;
    dialog.append(close,photo,caption);document.body.append(dialog);
    zoom.addEventListener('click',()=>dialog.showModal());
    close.addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
    dialog.addEventListener('keydown',event=>event.stopPropagation());
    dialog.addEventListener('close',()=>zoom.focus());
  }
})();
