/* ================= PRELOADER ================= */
(function(){
  const MIN_VISIBLE_MS = 900; // tempo mínimo pra não "piscar" em conexões rápidas
  const start = Date.now();
  const pre = document.getElementById('preloader');

  function hidePreloader(){
    const elapsed = Date.now() - start;
    const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);
    setTimeout(()=>{
      pre.classList.add('hide');
      pre.addEventListener('transitionend', ()=> pre.remove(), {once:true});
    }, wait);
  }

  if(document.readyState === 'complete'){
    hidePreloader();
  } else {
    window.addEventListener('load', hidePreloader);
    // fallback de segurança caso 'load' demore demais (ex: recursos externos lentos)
    setTimeout(hidePreloader, 3500);
  }
})();

/* ================= DATA ================= */
const icon = {
  drop: `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C8 8 5 11.5 5 15a7 7 0 0 0 14 0c0-3.5-3-7-7-13Z"/></svg>`,
  flower: `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2.5"/><path d="M12 2a4 4 0 0 1 0 8 4 4 0 0 1 0-8Z"/><path d="M12 14a4 4 0 0 1 0 8 4 4 0 0 1 0-8Z"/><path d="M2 12a4 4 0 0 1 8 0 4 4 0 0 1-8 0Z"/><path d="M14 12a4 4 0 0 1 8 0 4 4 0 0 1-8 0Z"/></svg>`,
  bottle: `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2h6v4l2 3v11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V9l2-3Z"/><path d="M9 9h6"/></svg>`,
  leaf: `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 4 13c0-6 7-11 15-11 0 8-5 15-11 15-1.5 0-2-.5-3-2Z"/></svg>`,
  heart: `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>`,
  jar: `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="8" width="14" height="13" rx="2"/><path d="M7 8V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"/></svg>`,
};

const products = [
  {id:1, name:"Óleo Corporal Flor de Cerejeira", desc:"Hidratação profunda com toque seco e brilho natural.", price:89.90, icon:icon.drop, bg:"linear-gradient(135deg,#F7D9DE,#F0C4CE)"},
  {id:2, name:"Creme para Mãos Camélia & Karité", desc:"Textura leve, absorção rápida, perfume floral suave.", price:49.90, icon:icon.jar, bg:"linear-gradient(135deg,#F3E1D8,#E9C9B6)"},
  {id:3, name:"Bruma Perfumada Jardim Secreto", desc:"Um véu de perfume para corpo, cabelo e ambiente.", price:69.90, icon:icon.bottle, bg:"linear-gradient(135deg,#DCE5D3,#C7D8B8)"},
  {id:4, name:"Sabonete Artesanal Lavanda", desc:"Espuma cremosa, aroma relaxante, feito à mão.", price:24.90, icon:icon.leaf, bg:"linear-gradient(135deg,#E4D9F2,#D2C2E8)"},
  {id:5, name:"Batom Líquido Pétala", desc:"Cor aveludada de longa duração com efeito hidratante.", price:39.90, icon:icon.heart, bg:"linear-gradient(135deg,#F5C9CE,#E89AA5)"},
  {id:6, name:"Água de Perfume Viona Essencial", desc:"Assinatura olfativa floral-amadeirada, alta fixação.", price:159.90, icon:icon.flower, bg:"linear-gradient(135deg,#FBE2C4,#F0C48A)"},
  {id:7, name:"Manteiga Corporal Amêndoas & Mel", desc:"Nutrição intensa para peles secas, textura macia.", price:59.90, icon:icon.jar, bg:"linear-gradient(135deg,#F3E7C9,#E9D6A0)"},
  {id:8, name:"Kit Presente Buquê de Aromas", desc:"Trio de miniaturas para presentear ou experimentar.", price:129.90, icon:icon.flower, bg:"linear-gradient(135deg,#F0C4CE,#DCE5D3)"},
];

let cart = {}; // id -> qty
let selectedPayment = 'pix';
let mode = 'cart'; // 'cart' | 'checkout' | 'success'

const fmt = v => v.toLocaleString('pt-BR', {style:'currency', currency:'BRL'});

/* ================= RENDER CATALOG ================= */
const grid = document.getElementById('productGrid');
grid.innerHTML = products.map(p => `
  <div class="card">
    <div class="card-visual" style="background:${p.bg}">${p.icon}</div>
    <h3>${p.name}</h3>
    <div class="desc">${p.desc}</div>
    <div class="price-row">
      <span class="price">${fmt(p.price)}</span>
      <button class="add-btn" id="add-${p.id}" onclick="addToCart(${p.id})" aria-label="Adicionar à sacola">
        <svg viewBox="0 0 24 24" fill="none" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
      </button>
    </div>
  </div>
`).join('');

/* ================= CART LOGIC ================= */
function addToCart(id){
  cart[id] = (cart[id] || 0) + 1;
  const btn = document.getElementById(`add-${id}`);
  btn.classList.add('added');
  btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`;
  setTimeout(()=>{
    btn.classList.remove('added');
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>`;
  }, 900);
  updateCartUI();
}
function changeQty(id, delta){
  cart[id] = (cart[id] || 0) + delta;
  if(cart[id] <= 0) delete cart[id];
  renderCart();
  updateCartUI();
}
function cartTotals(){
  let count=0, total=0;
  for(const id in cart){
    const p = products.find(p=>p.id==id);
    count += cart[id];
    total += p.price * cart[id];
  }
  return {count, total};
}
function updateCartUI(){
  const {count, total} = cartTotals();
  const cc = document.getElementById('cartCount');
  cc.style.display = count>0 ? 'flex' : 'none';
  cc.textContent = count;
  const bar = document.getElementById('mobileBar');
  if(count>0){
    bar.classList.add('show');
    document.getElementById('mobileBarInfo').textContent = `${count} ${count===1?'item':'itens'}`;
    document.getElementById('mobileBarTotal').textContent = fmt(total);
  } else {
    bar.classList.remove('show');
  }
}

/* ================= DRAWER RENDER ================= */
function renderCart(){
  mode = 'cart';
  const {count, total} = cartTotals();
  document.getElementById('drawerTitle').textContent = 'Sua sacola';
  const body = document.getElementById('drawerBody');
  const foot = document.getElementById('drawerFoot');

  if(count === 0){
    body.innerHTML = `<div class="empty-cart">
      <svg viewBox="0 0 24 24" fill="none" stroke-width="1.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
      <p>Sua sacola está vazia.<br>Que tal escolher um mimo? 🌷</p>
    </div>`;
    foot.innerHTML = '';
    return;
  }

  body.innerHTML = Object.keys(cart).map(id=>{
    const p = products.find(p=>p.id==id);
    return `<div class="cart-item">
      <div class="cart-item-icon" style="background:${p.bg}">${p.icon}</div>
      <div class="cart-item-info">
        <h4>${p.name}</h4>
        <div class="p">${fmt(p.price)}</div>
      </div>
      <div class="qty-ctrl">
        <button onclick="changeQty(${p.id}, -1)">−</button>
        <span>${cart[id]}</span>
        <button onclick="changeQty(${p.id}, 1)">+</button>
      </div>
    </div>`;
  }).join('');

  foot.innerHTML = `
    <div class="subtotal-row">
      <span class="label">Subtotal</span>
      <span class="value">${fmt(total)}</span>
    </div>
    <button class="btn-primary" style="width:100%; display:block; text-align:center;" onclick="renderCheckout()">Finalizar pedido</button>
  `;
}

function renderCheckout(){
  mode = 'checkout';
  document.getElementById('drawerTitle').textContent = 'Finalizar pedido';
  const {total} = cartTotals();
  const body = document.getElementById('drawerBody');
  body.innerHTML = `
    <div class="field">
      <label>Nome completo</label>
      <input type="text" placeholder="Como podemos te chamar?">
    </div>
    <div class="field">
      <label>E-mail</label>
      <input type="email" placeholder="voce@email.com">
    </div>
    <div class="field">
      <label>Telefone / WhatsApp</label>
      <input type="tel" placeholder="(11) 99999-9999">
    </div>
    <div class="field">
      <label>Endereço de entrega</label>
      <input type="text" placeholder="Rua, número, bairro, cidade">
    </div>
    <div class="field">
      <label>Forma de pagamento</label>
      <div class="pay-options">
        <div class="pay-option active" id="pay-pix" onclick="selectPayment('pix')">Pix</div>
        <div class="pay-option" id="pay-card" onclick="selectPayment('card')">Cartão</div>
      </div>
    </div>
  `;
  document.getElementById('drawerFoot').innerHTML = `
    <div class="subtotal-row">
      <span class="label">Total</span>
      <span class="value">${fmt(total)}</span>
    </div>
    <button class="btn-primary" style="width:100%; display:block; text-align:center;" onclick="confirmOrder()">Confirmar pedido 🌸</button>
  `;
}

function selectPayment(type){
  selectedPayment = type;
  document.getElementById('pay-pix').classList.toggle('active', type==='pix');
  document.getElementById('pay-card').classList.toggle('active', type==='card');
}

function confirmOrder(){
  mode = 'success';
  document.getElementById('drawerTitle').textContent = 'Pedido confirmado';
  document.getElementById('drawerBody').innerHTML = `
    <div class="success-screen show">
      <div class="success-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
      </div>
      <h3>Obrigada por florescer com a Viona! 🌷</h3>
      <p>Seu pedido foi recebido com carinho. Em instantes você recebe a confirmação por e-mail.</p>
    </div>
  `;
  document.getElementById('drawerFoot').innerHTML = `
    <button class="btn-primary" style="width:100%; display:block; text-align:center;" onclick="finishAndReset()">Voltar ao catálogo</button>
  `;
  fireConfetti();
  cart = {};
  updateCartUI();
}

function finishAndReset(){
  closeDrawer();
}

function fireConfetti(){
  const colors = ['#C6455D', '#E8935B', '#C9A15A', '#7E9270', '#F0C4CE'];
  confetti({particleCount:120, spread:80, origin:{y:0.4}, colors});
  setTimeout(()=>confetti({particleCount:60, spread:100, origin:{x:0.2, y:0.3}, colors}), 200);
  setTimeout(()=>confetti({particleCount:60, spread:100, origin:{x:0.8, y:0.3}, colors}), 350);
}

/* ================= DRAWER OPEN/CLOSE ================= */
function openDrawer(which){
  document.getElementById('overlay').classList.add('show');
  document.getElementById('drawer').classList.add('show');
  if(which === 'cart') renderCart();
}
function closeDrawer(){
  document.getElementById('overlay').classList.remove('show');
  document.getElementById('drawer').classList.remove('show');
}

/* ================= SCROLL REVEAL ================= */
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
}, {threshold:0.15});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
