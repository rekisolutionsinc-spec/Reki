// hero slider
const S=[...document.querySelectorAll('.slide')],D=document.getElementById('dots');let c=0,t;
S.forEach((_,i)=>{const b=document.createElement('button');b.setAttribute('aria-label','Slide '+(i+1));b.onclick=()=>go(i);D.append(b)});
function go(i){S[c].classList.remove('on');D.children[c].classList.remove('on');c=i;S[c].classList.add('on');D.children[c].classList.add('on');clearInterval(t);t=setInterval(()=>go((c+1)%S.length),7000)}
go(0);
// CMS-driven news
const esc=s=>String(s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
fetch('content/news.json').then(r=>r.json()).then(items=>{
  items.sort((a,b)=>b.date.localeCompare(a.date));
  document.getElementById('news').innerHTML=items.slice(0,3).map(p=>`<a class="card rv in" href="${esc(p.url)}"><img src="${esc(p.image)}" alt="" loading="lazy"><div class="t"><time datetime="${esc(p.date)}">${new Date(p.date).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</time><h3>${esc(p.title)}</h3></div></a>`).join('')}).catch(()=>{});
// Paystack donation (the old script looked for #donation-form, which does not exist, so the button never worked)
document.getElementById('donateForm').addEventListener('submit',e=>{
  e.preventDefault();
  const name=fullName.value.trim(),mail=email.value.trim(),amt=Math.round(parseFloat(amount.value)*100);
  if(!window.PaystackPop){alert('Payment is still loading. Please try again in a moment.');return}
  PaystackPop.setup({key:'YOUR_PAYSTACK_PUBLIC_KEY',email:mail,amount:amt,currency:'GHS',
    metadata:{custom_fields:[{display_name:'Name',variable_name:'name',value:name},{display_name:'Frequency',variable_name:'frequency',value:recurring.value}]},
    callback:()=>{alert('Thank you, '+name+'! Your donation was successful.');e.target.reset()},
    onClose:()=>{}}).openIframe();
});
