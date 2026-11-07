(function(){
var KEY='pmm_cart';
function get(){try{return JSON.parse(localStorage.getItem(KEY))||[]}catch(e){return []}}
function set(c){try{localStorage.setItem(KEY,JSON.stringify(c))}catch(e){}bubble()}
function money(n){return 'Rs. '+n.toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2})}
function esc(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML}
function bubble(){var n=get().reduce(function(a,i){return a+i.qty},0),l=document.getElementById('cart-icon-bubble');if(!l)return;var b=l.querySelector('.cart-count-bubble');if(b)b.remove();if(n){b=document.createElement('div');b.className='cart-count-bubble';b.innerHTML='<span aria-hidden="true">'+n+'</span>';l.appendChild(b)}}
function add(p,q){var c=get(),f=c.find(function(i){return i.handle===p.handle});if(f)f.qty+=q;else{p.qty=q;c.push(p)}set(c)}
function toast(t){var e=document.getElementById('pmm-toast');e.textContent=t+' added to your cart';e.classList.add('show');setTimeout(function(){e.classList.remove('show')},2500)}
document.addEventListener('click',function(e){
 var q=e.target.closest('[data-qty]');if(q){var i=document.getElementById('Quantity');i.value=Math.max(1,(+i.value||1)+(+q.dataset.qty));return}
 var a=e.target.closest('[data-add]');if(a){var i=document.getElementById('Quantity'),p=JSON.parse(a.dataset.add);add(p,i?Math.max(1,+i.value||1):1);if(a.hasAttribute('data-buy'))location.href='/cart/';else toast(p.title);return}
 var r=e.target.closest('[data-remove]');if(r){set(get().filter(function(i){return i.handle!==r.dataset.remove}));cart();return}
 var s=e.target.closest('[data-step]');if(s){var c=get(),it=c.find(function(i){return i.handle===s.dataset.h});it.qty=Math.max(1,it.qty+(+s.dataset.step));set(c);cart()}
 if(e.target.closest('[data-checkout]'))alert('Demo only. Real checkout, payments and orders come from Shopify.');
});
function cart(){var el=document.getElementById('pmm-cart');if(!el)return;var c=get();
 if(!c.length){el.innerHTML='<div class="center"><h1 class="h1">Your cart is empty</h1><a class="button" href="/collections/all/">Continue shopping</a></div>';return}
 var t=0,h='<h1 class="h1">Your cart</h1><table class="pmm-cart">';c.forEach(function(i){t+=i.price*i.qty;h+='<tr><td><img src="'+i.image+'" width="90" height="90" alt=""></td><td><a href="/products/'+i.handle+'/">'+esc(i.title)+'</a><br>'+money(i.price)+'</td><td class="pmm-q"><button data-step="-1" data-h="'+i.handle+'">−</button> '+i.qty+' <button data-step="1" data-h="'+i.handle+'">+</button> <button data-remove="'+i.handle+'">Remove</button></td><td>'+money(i.price*i.qty)+'</td></tr>'});
 el.innerHTML=h+'</table><p class="pmm-total"><b>Estimated total</b> '+money(t)+'</p><p class="pmm-total"><button class="button" data-checkout>Check out</button></p>'}
function search(){var el=document.getElementById('pmm-results');if(!el)return;var q=(new URLSearchParams(location.search).get('q')||'').toLowerCase().trim();document.getElementById('pmm-q').textContent=q;
 fetch('/search-index.json').then(function(r){return r.json()}).then(function(a){var m=a.filter(function(p){return q&&p.title.toLowerCase().indexOf(q)>-1});document.getElementById('pmm-n').textContent=m.length;el.innerHTML=m.map(function(p){return '<li><a class="pmm-link" href="/products/'+p.handle+'/"><img src="'+p.image+'" alt="" loading="lazy"><span>'+esc(p.title)+'</span></a></li>'}).join('')})}
bubble();cart();search();
})();
