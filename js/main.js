// R&C Airmakers v3.0 - Modern Animations & Features

const SHEET_URL = 'https://script.google.com/macros/s/AKfycbw62fw7OGxXp5S_FQ9nRy_41o7VLvHvkFejm-X-2om3l2RNfe_qthiUR8yI_9Wm5SbSrw/exec';

// ===== Navbar Scroll Effect =====
const header = document.querySelector('header');

function handleNavScroll() {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
}

window.addEventListener('scroll', handleNavScroll);
handleNavScroll();


// ===== Scroll Reveal (Intersection Observer) =====
function initReveal() {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    reveals.forEach(el => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', initReveal);


// ===== Counter Animation =====
function animateCounters() {
    const counters = document.querySelectorAll('.highlight h3[data-target]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = el.getAttribute('data-target');
                const suffix = el.getAttribute('data-suffix') || '';

                if (isNaN(parseInt(target))) {
                    observer.unobserve(el);
                    return;
                }

                const finalNum = parseInt(target);
                let current = 0;
                const increment = Math.ceil(finalNum / 40);
                const duration = 1200;
                const stepTime = duration / (finalNum / increment);

                const timer = setInterval(() => {
                    current += increment;
                    if (current >= finalNum) {
                        current = finalNum;
                        clearInterval(timer);
                    }
                    el.textContent = current + suffix;
                }, stepTime);

                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', animateCounters);


// ===== Quote Calculator =====
(function initCalculator() {
    const calc = document.getElementById('calculator');
    if (!calc) return;

    const PRICING = {
        'Aircon Cleaning': { min: 800, max: 10500 },
        'Aircon Installation': { min: 4500, max: 31000 },
        'Repair & Troubleshooting': { min: 0, max: 28000 },
        'Preventive Maintenance': { min: 2500, max: 6500 },
        'Freon Charging': { min: 0, max: 0 },
        'Commercial HVAC': { min: 72500, max: 238000 }
    };

    const HP_ADDER = {
        '2.0 HP': 1000,
        '2.5 HP & up': 2000
    };

    const panes = calc.querySelectorAll('.calc-pane');
    const dots = calc.querySelectorAll('.calc-step-dot');
    const progressLines = calc.querySelectorAll('.calc-progress-line');
    const options = calc.querySelectorAll('.calc-option');
    const selection = { service: null, unit: null, hp: null };

    function goToStep(n) {
        panes.forEach((p, i) => p.classList.toggle('active', i === n - 1));
        dots.forEach(d => {
            const dn = parseInt(d.getAttribute('data-dot'));
            d.classList.toggle('active', dn === n);
            d.classList.toggle('done', dn < n);
        });
        progressLines.forEach((l, i) => l.classList.toggle('done', i < n - 1));
    }

    // Auto-advance when a group is completed
    function maybeAdvance(typeofSelection) {
        if (typeofSelection === 'service' && selection.service) {
            setTimeout(() => goToStep(2), 250);
        }
        if (selection.unit && selection.hp) {
            setTimeout(() => { goToStep(3); showEstimate(); }, 250);
        }
    }

    // Back / restart buttons
    calc.querySelectorAll('[data-back]').forEach(btn => {
        btn.addEventListener('click', () => goToStep(parseInt(btn.getAttribute('data-back'))));
    });

    const restartBtn = calc.querySelector('#calc-restart');
    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            selection.service = null;
            selection.unit = null;
            selection.hp = null;
            options.forEach(o => o.classList.remove('selected'));
            goToStep(1);
        });
    }

    function showEstimate() {
        const pr = PRICING[selection.service];
        if (!pr) return;

        let min = pr.min;
        let max = pr.max;
        if (selection.service !== 'Commercial HVAC' && HP_ADDER[selection.hp]) {
            min += HP_ADDER[selection.hp];
            max += HP_ADDER[selection.hp];
        }

        const fmt = n => '\u20B1' + n.toLocaleString('en-PH');
        calc.querySelector('#calc-range').textContent = fmt(min) + '\u2013' + fmt(max);
        calc.querySelector('#calc-meta').textContent =
            selection.service + (selection.unit ? ' \u00B7 ' + selection.unit : '') +
            (selection.hp ? ' \u00B7 ' + selection.hp : '');

        // Prefill the booking form
        const serviceEl = document.getElementById('book-service');
        const hpEl = document.getElementById('book-hp');
        if (serviceEl) {
            const match = Array.from(serviceEl.options).find(o => o.value === selection.service);
            if (match) serviceEl.value = selection.service;
        }
        if (hpEl && selection.hp) {
            const match = Array.from(hpEl.options).find(o => o.value === selection.hp);
            if (match) hpEl.value = selection.hp;
        }
    }

    options.forEach(opt => {
        opt.addEventListener('click', () => {
            const group = opt.parentElement.getAttribute('data-question');
            opt.parentElement.querySelectorAll('.calc-option').forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            selection[group] = opt.getAttribute('data-value');
            maybeAdvance(group);
        });
    });
})();


// ===== Aircon Sales Estimator =====
(function initEstimator() {
    const est = document.getElementById('estimator');
    if (!est) return;

    let liveCatalog = null;

    // Fallback catalog: [brand, model, type, hp, tech, price]
    const CATALOG = [
        // Window Type
        ['Carrier','Creo','window',0.5,'Non Inverter',18500],
        ['HK','F8 Series','window',1.0,'Non Inverter',21250],
        ['Matrix','MTX','window',1.0,'Inverter',22000],
        ['TCL','WT','window',1.0,'Inverter',23000],
        ['Fujidenzo','FJDZ1','window',0.8,'Inverter',23000],
        ['Carrier','Creo','window',0.8,'Non Inverter',24000],
        ['Fujidenzo','FJDZ2','window',1.0,'Inverter',24000],
        ['Carrier','Creo','window',1.0,'Non Inverter',24500],
        ['TCL','WT','window',1.5,'Inverter',25000],
        ['Fujidenzo','Creo','window',0.8,'Inverter',25400],
        ['Fujidenzo','FJDZ3','window',1.5,'Inverter',26000],
        ['Kolin','Quad','window',0.8,'Inverter',26600],
        ['Fujidenzo','Creo','window',1.0,'Inverter',27200],
        ['Carrier','Aura','window',1.0,'Non Inverter',28200],
        ['HK','F9','window',1.0,'Inverter',28690],
        ['Kolin','Quad','window',1.0,'Inverter',28700],
        ['Carrier','Aura','window',1.5,'Non Inverter',31000],
        ['Kolin','Creo','window',1.5,'Inverter',29500],
        ['HK','F9','window',1.5,'Inverter',32990],
        ['Panasonic','PANAWINAC','window',1.0,'Inverter',33000],
        ['Kolin','Quad','window',1.5,'Inverter',32000],
        ['TCL','WT','window',2.0,'Inverter',34000],
        ['Panasonic','PANAWINAC','window',1.5,'Inverter',37000],
        ['Kolin','Creo','window',2.0,'Inverter',36500],
        ['Carrier','Creo','window',2.0,'Non Inverter',37700],
        ['Carrier','Aura','window',2.0,'Non Inverter',39800],
        ['Kolin','Quad','window',2.0,'Inverter',39400],
        ['HK','F9','window',2.0,'Inverter',40090],
        ['Carrier','Creo','window',2.5,'Non Inverter',40800],
        ['Carrier','Aura','window',2.5,'Non Inverter',43500],
        ['Kolin','Quad','window',2.5,'Inverter',43700],
        ['HK','F9','window',2.5,'Inverter',42690],
        ['TCL','WT','window',2.5,'Inverter',37000],
        ['Panasonic','PANAWINAC','window',2.0,'Inverter',48000],
        ['Carrier','Aura','window',2.0,'Inverter',50500],
        ['Panasonic','PANAWINAC','window',2.5,'Inverter',56000],

        // Split Type
        ['American Home','AMH','split',1.0,'Inverter',24200],
        ['CHIQ','MORANDI','split',1.0,'Inverter',25000],
        ['TCL','KEI2','split',1.0,'Inverter',25700],
        ['AUX','F- Series','split',1.0,'Inverter',26000],
        ['AUX','Prima Series','split',1.0,'Full DC Inverter',26099],
        ['TCL','TAC-BR','split',1.0,'Inverter',26500],
        ['Samsung','TYHY','split',1.0,'Inverter',27000],
        ['Midea','Celest Pro','split',1.0,'Inverter',27500],
        ['TCL','BEI','split',1.0,'Inverter',28000],
        ['Samsung','CYEA','split',1.0,'Inverter',28300],
        ['AUX','Futura Series','split',1.0,'Inverter',28699],
        ['Fujidenzo','HD','split',1.0,'Inverter',29700],
        ['Gree','Crystal','split',1.0,'Inverter',30650],
        ['Kolin','Certus Ai','split',1.0,'Inverter',31000],
        ['Carrier','Nexus','split',1.0,'Inverter',31300],
        ['Carrier','Optima','split',1.0,'Inverter',32700],
        ['Koppel','KV-WM','split',1.0,'Inverter',35720],
        ['Kolin','Primus','split',1.0,'Inverter',37100],
        ['Panasonic','PU','split',1.0,'Inverter',37700],
        ['LG','1PX2','split',1.0,'Inverter',36500],
        ['LG','1PX3','split',1.0,'Inverter',38000],
        ['Carrier','Aura','split',1.0,'Inverter',37700],
        ['Daikin','D-Smart','split',1.0,'Inverter',36500],
        ['Daikin','Queen','split',1.0,'Inverter',43000],
        ['Daikin Amihan','AVA','split',1.0,'Inverter',33000],
        ['Panasonic','RU Deluxe','split',1.0,'Inverter',43500],
        ['Panasonic','XU Premium','split',1.0,'Inverter',46000],
        ['Samsung','Byham Windfree','split',1.0,'Inverter',33400],
        ['TCL','P7','split',1.0,'Inverter',33900],
        ['TCL','WEI','split',1.0,'Inverter',30500],
        ['Condura','Prima','split',1.0,'Inverter',30000],

        ['American Home','AMH','split',1.5,'Inverter',25500],
        ['CHIQ','MORANDI','split',1.5,'Inverter',26000],
        ['TCL','KEI2','split',1.5,'Inverter',26700],
        ['AUX','Prima Series','split',1.5,'Full DC Inverter',26999],
        ['TCL','TAC-BR','split',1.5,'Inverter',27500],
        ['Midea','Celest Pro','split',1.5,'Inverter',28500],
        ['Samsung','TYHY','split',1.5,'Inverter',29000],
        ['TCL','BEI','split',1.5,'Inverter',29000],
        ['LG','IBA Dual Inverter','split',1.5,'Inverter',30000],
        ['AUX','Futura Series','split',1.5,'Inverter',31299],
        ['Fujidenzo','HD','split',1.5,'Inverter',31900],
        ['Gree','Crystal','split',1.5,'Inverter',32950],
        ['Kolin','Certus Ai','split',1.5,'Inverter',32800],
        ['Condura','Prima','split',1.5,'Inverter',32400],
        ['Carrier','Nexus','split',1.5,'Inverter',33700],
        ['Samsung','CYEA','split',1.5,'Inverter',29800],
        ['Samsung','Byham Windfree','split',1.5,'Inverter',36400],
        ['TCL','P7','split',1.5,'Inverter',36900],
        ['TCL','WEI','split',1.5,'Inverter',32500],
        ['Koppel','KV-WM','split',1.5,'Inverter',38950],
        ['Kolin','Primus','split',1.5,'Inverter',40100],
        ['Panasonic','PU','split',1.5,'Inverter',41600],
        ['LG','1PX2','split',1.5,'Inverter',38500],
        ['LG','1PX3','split',1.5,'Inverter',40000],
        ['Carrier','Optima','split',1.5,'Inverter',36900],
        ['Carrier','Aura','split',1.5,'Inverter',42500],
        ['Daikin','D-Smart','split',1.5,'Inverter',40000],
        ['Daikin','Queen','split',1.5,'Inverter',47000],
        ['Daikin Amihan','AVA','split',1.5,'Inverter',34500],
        ['Panasonic','RU Deluxe','split',1.5,'Inverter',47500],
        ['Panasonic','XU Premium','split',1.5,'Inverter',50000],

        ['American Home','AMH','split',2.0,'Inverter',31000],
        ['CHIQ','MORANDI','split',2.0,'Inverter',30700],
        ['AUX','Prima Series','split',2.0,'Full DC Inverter',32549],
        ['TCL','KEI2','split',2.0,'Inverter',31700],
        ['TCL','TAC-BR','split',2.0,'Inverter',32500],
        ['Samsung','TYHY','split',2.0,'Inverter',33400],
        ['Midea','Celest Pro','split',2.0,'Inverter',33500],
        ['TCL','BEI','split',2.0,'Inverter',35500],
        ['Samsung','Byham Windfree','split',2.0,'Inverter',43400],
        ['TCL','P7','split',2.0,'Inverter',44900],
        ['TCL','WEI','split',2.0,'Inverter',38500],
        ['AUX','Futura Series','split',2.0,'Inverter',37699],
        ['Fujidenzo','HD','split',2.0,'Inverter',38700],
        ['Gree','Crystal','split',2.0,'Inverter',38200],
        ['Kolin','Certus Ai','split',2.0,'Inverter',40000],
        ['Condura','Prima','split',2.0,'Inverter',40500],
        ['Carrier','Nexus','split',2.0,'Inverter',41500],
        ['Carrier','Optima','split',2.0,'Inverter',43900],
        ['Koppel','KV-WM','split',2.0,'Inverter',46900],
        ['Kolin','Primus','split',2.0,'Inverter',50100],
        ['Panasonic','PU','split',2.0,'Inverter',52400],
        ['LG','1PX2','split',2.0,'Inverter',43600],
        ['LG','1PX3','split',2.0,'Inverter',44000],
        ['Carrier','Aura','split',2.0,'Inverter',51500],
        ['Daikin','D-Smart','split',2.0,'Inverter',49000],
        ['Daikin','Queen','split',2.0,'Inverter',57000],
        ['Daikin Amihan','AVA','split',2.0,'Inverter',43500],
        ['Panasonic','RU Deluxe','split',2.0,'Inverter',58500],
        ['Panasonic','XU Premium','split',2.0,'Inverter',60500],

        ['American Home','AMH','split',2.5,'Inverter',34000],
        ['CHIQ','MORANDI','split',2.5,'Inverter',35300],
        ['TCL','KEI2','split',2.5,'Inverter',36500],
        ['AUX','Prima Series','split',2.5,'Full DC Inverter',37349],
        ['TCL','TAC-BR','split',2.5,'Inverter',37500],
        ['Samsung','TYHY','split',2.5,'Inverter',37700],
        ['Midea','Celest Pro','split',2.5,'Inverter',38500],
        ['TCL','BEI','split',2.5,'Inverter',39000],
        ['TCL','WEI','split',2.5,'Inverter',42500],
        ['Samsung','Byham Windfree','split',2.5,'Inverter',50400],
        ['AUX','Futura Series','split',2.5,'Inverter',43999],
        ['Fujidenzo','HD','split',2.5,'Inverter',45900],
        ['Gree','Crystal','split',2.5,'Inverter',48100],
        ['Kolin','Certus Ai','split',2.5,'Inverter',45500],
        ['Condura','Prima','split',2.5,'Inverter',46500],
        ['Carrier','Nexus','split',2.5,'Inverter',44600],
        ['Carrier','Optima','split',2.5,'Inverter',51500],
        ['Koppel','KV-WM','split',2.5,'Inverter',53000],
        ['Kolin','Primus','split',2.5,'Inverter',56100],
        ['Panasonic','PU','split',2.5,'Inverter',63200],
        ['LG','1PX2','split',2.5,'Inverter',50200],
        ['LG','1PX3','split',2.5,'Inverter',52500],
        ['Carrier','Aura','split',2.5,'Inverter',60500],
        ['Daikin','D-Smart','split',2.5,'Inverter',55000],
        ['Daikin','Queen','split',2.5,'Inverter',64500],
        ['Panasonic','RU Deluxe','split',2.5,'Inverter',69500],
        ['Panasonic','XU Premium','split',2.5,'Inverter',71500],

        ['American Home','AMH','split',3.0,'Inverter',45500],
        ['AUX','Prima Series','split',3.0,'Full DC Inverter',49199],
        ['TCL','KEI2','split',3.0,'Inverter',50000],
        ['Midea','Celest Pro','split',3.0,'Inverter',54500],
        ['Gree','Crystal','split',3.0,'Inverter',57900],
        ['Kolin','Primus','split',3.0,'Inverter',63500],
        ['Carrier','Optima','split',3.0,'Inverter',75500],
        ['Panasonic','PU','split',3.0,'Inverter',74200],
        ['LG','1PX3','split',3.0,'Inverter',85500],
        ['Koppel','KV-WM','split',3.0,'Inverter',70500],

        ['Gree','Crystal','split',4.0,'Inverter',63700],

        // Commercial / Floor / Cassette / Ducted
        ['AUX','Floor Standing','commercial',4.0,'Full DC Inverter',75500],
        ['AUX','Floor Standing','commercial',6.0,'Full DC Inverter',96500],
        ['HK','GA Series Floor','commercial',6.0,'Inverter',95500],
        ['Midea','2026 Floor','commercial',6.0,'Inverter',127000],
        ['AUX','Ceiling Cassette','commercial',4.0,'Full DC Inverter',78000],
        ['AUX','Ceiling Cassette','commercial',5.0,'Full DC Inverter',96500],
        ['AUX','Ceiling Cassette','commercial',6.0,'Full DC Inverter',99500],
        ['AUX','Ducted Type','commercial',4.0,'Full DC Inverter',72500],
        ['AUX','Ducted Type','commercial',5.0,'Full DC Inverter',97000],
        ['AUX','Ducted Type','commercial',6.0,'Full DC Inverter',99500],
        ['Daikin','Ceiling Mounted','commercial',3.5,'Inverter',136800],
        ['Daikin','Ceiling Cassette','commercial',3.5,'Inverter',136100],
        ['Daikin','Ceiling Cassette','commercial',2.0,'Inverter',116000],
        ['Daikin','Ceiling Cassette','commercial',2.5,'Inverter',146000],
        ['Daikin','Ceiling Cassette','commercial',3.0,'Inverter',163000],
        ['Daikin','Ceiling Cassette','commercial',4.0,'Inverter',202000],
        ['Daikin','Ceiling Cassette','commercial',5.0,'Inverter',223000],
        ['Daikin','Ceiling Cassette','commercial',6.0,'Inverter',238000],
        ['Daikin','Multi Split','commercial',1.0,'Inverter',27000],
        ['Daikin','Multi Split','commercial',1.5,'Inverter',31000],
    ];

    // Room size → HP range
    const ROOM_HP = {
        small:  [0.5, 1.0],
        medium: [1.0, 1.5],
        large:  [2.0, 2.5],
        xlarge: [3.0, 6.0]
    };

    const TYPE_MAP = { window: 'window', split: 'split', any: null };

    const BUDGET_FILTER = {
        budget: { max: 28000 },
        mid:    { min: 25000, max: 50000 },
        premium:{ min: 45000 },
        any:    {}
    };

    const LABELS = { budget: 'Budget Pick', mid: 'Best Value', premium: 'Premium Pick' };

    const panes = est.querySelectorAll('.est-pane');
    const dots = est.querySelectorAll('.est-step-dot');
    const progressLines = est.querySelectorAll('.est-progress-line');
    const options = est.querySelectorAll('.est-option');
    const sel = { room: null, unitType: null, budget: null };

    function goToStep(n) {
        panes.forEach((p, i) => p.classList.toggle('active', i === n - 1));
        dots.forEach(d => {
            const dn = parseInt(d.getAttribute('data-dot'));
            d.classList.toggle('active', dn === n);
            d.classList.toggle('done', dn < n);
        });
        progressLines.forEach((l, i) => l.classList.toggle('done', i < n - 1));
    }

    function maybeAdvance(group) {
        if (group === 'room' && sel.room) {
            setTimeout(() => goToStep(2), 250);
        }
        if (group === 'unitType' && sel.unitType) {
            setTimeout(() => goToStep(3), 250);
        }
        if (sel.room && sel.unitType && sel.budget) {
            setTimeout(() => { goToStep(4); showResult(); }, 250);
        }
    }

    // Fetch live catalog from Google Sheet
    async function fetchCatalog() {
        try {
            const res = await fetch(SHEET_URL + '?action=data&t=' + Date.now());
            const data = await res.json();
            if (data.products && data.products.length > 0) {
                liveCatalog = data.products.map(p => [
                    p.Brand || '',
                    p.Model || '',
                    (p.Type || '').toLowerCase().includes('window') ? 'window' :
                    (p.Type || '').toLowerCase().includes('split') || (p.Type || '').toLowerCase().includes('wall') ? 'split' : 'commercial',
                    parseFloat(p.HP) || 1.0,
                    p.Technology || 'Inverter',
                    parseFloat(p.DiscountedPrice) || 0
                ]).filter(p => p[5] > 0);
            }
        } catch (e) {
            // Use hardcoded fallback
        }
    }
    fetchCatalog();

    function showResult() {
        const [minHp, maxHp] = ROOM_HP[sel.room] || [1.0, 1.5];
        const filterType = TYPE_MAP[sel.unitType];
        const bAdj = BUDGET_FILTER[sel.budget] || BUDGET_FILTER.any;
        const catalog = liveCatalog || CATALOG;

        let matches = catalog.filter(item => {
            if (item[3] < minHp || item[3] > maxHp) return false;
            if (filterType && item[2] !== filterType) return false;
            if (bAdj.max && item[5] > bAdj.max) return false;
            if (bAdj.min && item[5] < bAdj.min) return false;
            return true;
        });

        matches.sort((a, b) => a[5] - b[5]);

        if (matches.length === 0) {
            matches = catalog.filter(item => {
                if (item[3] < minHp || item[3] > maxHp) return false;
                if (filterType && item[2] !== filterType) return false;
                return true;
            }).sort((a, b) => a[5] - b[5]);
        }

        const picks = [];
        if (matches.length > 0) picks.push(matches[0]);
        if (matches.length > 2) picks.push(matches[Math.floor(matches.length / 2)]);
        if (matches.length > 1) picks.push(matches[matches.length - 1]);

        const fmt = n => '\u20B1' + n.toLocaleString('en-PH');
        const typeName = { window: 'Window Type', split: 'Split Type', any: 'Aircon Unit' }[sel.unitType] || 'Aircon Unit';
        const hpLabel = minHp === maxHp ? minHp + ' HP' : minHp + '–' + maxHp + ' HP';

        est.querySelector('#est-rec-type').textContent = typeName;
        est.querySelector('#est-rec-hp').textContent = hpLabel + ' recommended for your space';

        const picksEl = est.querySelector('#est-picks');
        picksEl.innerHTML = '';

        const tiers = ['budget', 'mid', 'premium'];
        picks.forEach((item, i) => {
            const tier = tiers[i] || 'mid';
            const card = document.createElement('div');
            card.className = 'est-pick' + (i === 1 ? ' featured' : '');
            card.innerHTML =
                '<span class="est-pick-label ' + tier + '">' + LABELS[tier] + '</span>' +
                '<div class="est-pick-brand">' + item[0] + '</div>' +
                '<div class="est-pick-model">' + item[1] + '</div>' +
                '<div class="est-pick-tech">' + item[3] + ' HP \u00B7 ' + item[4] + '</div>' +
                '<div class="est-pick-price">' + fmt(item[5]) + '</div>' +
                '<a class="est-pick-btn" href="https://m.me/RCairmakersbulacan?text=' +
                encodeURIComponent('Hi! I\'m interested in the ' + item[0] + ' ' + item[1] + ' ' + item[3] + 'HP (' + item[4] + ') at ' + fmt(item[5]) + '. Is this available?') +
                '" target="_blank" rel="noopener noreferrer">Inquire</a>';
            picksEl.appendChild(card);
        });
    }

    est.querySelectorAll('[data-back]').forEach(btn => {
        btn.addEventListener('click', () => goToStep(parseInt(btn.getAttribute('data-back'))));
    });

    const restartBtn = est.querySelector('#est-restart');
    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            sel.room = null;
            sel.unitType = null;
            sel.budget = null;
            options.forEach(o => o.classList.remove('selected'));
            goToStep(1);
        });
    }

    options.forEach(opt => {
        opt.addEventListener('click', () => {
            const group = opt.parentElement.getAttribute('data-question');
            opt.parentElement.querySelectorAll('.est-option').forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            sel[group] = opt.getAttribute('data-value');
            maybeAdvance(group);
        });
    });
})();


// ===== Booking Form =====
(function initBooking() {
    const form = document.getElementById('book-form');
    if (!form) return;

    // Google Sheet Apps Script URL
    const BOOKING_URL = 'https://script.google.com/macros/s/AKfycbw62fw7OGxXp5S_FQ9nRy_41o7VLvHvkFejm-X-2om3l2RNfe_qthiUR8yI_9Wm5SbSrw/exec';

    // Prevent past dates
    const dateInput = document.getElementById('book-date');
    if (dateInput) {
        const today = new Date();
        dateInput.min = today.toISOString().split('T')[0];
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('book-name').value.trim();
        const phone = document.getElementById('book-phone').value.trim();
        const service = document.getElementById('book-service').value;
        const hp = document.getElementById('book-hp').value;
        const date = document.getElementById('book-date').value;
        const time = document.getElementById('book-time').value;
        const notes = document.getElementById('book-notes').value.trim();

        if (!name || !phone || !service || !date || !time) {
            alert('Please fill in all required fields.');
            return;
        }

        const fmtDate = new Date(date + 'T00:00:00').toLocaleDateString('en-PH', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });

        const summary =
            'Hi R&C Airmakers!\n\n' +
            'Booking Request:\n' +
            'Name: ' + name + '\n' +
            'Phone: ' + phone + '\n' +
            'Service: ' + service + (hp && hp !== 'Not sure / N/A' ? ' (' + hp + ')' : '') + '\n' +
            'Date: ' + fmtDate + '\n' +
            'Time: ' + time +
            (notes ? '\nNotes: ' + notes : '') +
            '\n\nPlease confirm my schedule. Thank you!';

        const box = document.getElementById('book-summary');
        document.getElementById('book-summary-text').textContent = summary;

        const messengerLink = document.getElementById('book-messenger');
        messengerLink.href = 'https://m.me/RCairmakersbulacan?text=' + encodeURIComponent(summary);

        const copyBtn = document.getElementById('book-copy');
        copyBtn.dataset.text = summary;

        // Show loading state
        const submitBtn = form.querySelector('.form-submit');
        const origText = submitBtn.textContent;
        submitBtn.textContent = 'Saving...';
        submitBtn.disabled = true;

        // POST to Google Sheet
        fetch(BOOKING_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: name,
                phone: phone,
                service: service,
                hp: hp || '',
                date: date,
                time: time,
                notes: notes
            })
        })
        .then(() => {
            box.classList.remove('hidden');
            submitBtn.textContent = 'Saved!';
            submitBtn.style.background = '#22c55e';

            // Also store summary for messenger fallback
            copyBtn.dataset.text = summary;
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(copyBtn.dataset.text).then(() => {
                    copyBtn.textContent = 'Copied!';
                    setTimeout(() => { copyBtn.textContent = 'Copy Message'; }, 2000);
                });
            });

            box.scrollIntoView({ behavior: 'smooth', block: 'center' });

            setTimeout(() => {
                submitBtn.textContent = origText;
                submitBtn.style.background = '';
                submitBtn.disabled = false;
                form.reset();
            }, 3000);
        })
        .catch(() => {
            // Fallback: show Messenger option
            box.classList.remove('hidden');
            submitBtn.textContent = origText;
            submitBtn.disabled = false;

            document.getElementById('book-summary-text').textContent =
                summary + '\n\n(Sheet capture failed — send via Messenger instead)';

            copyBtn.dataset.text = summary;
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(copyBtn.dataset.text).then(() => {
                    copyBtn.textContent = 'Copied!';
                    setTimeout(() => { copyBtn.textContent = 'Copy Message'; }, 2000);
                });
            });

            box.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    });
})();

// ===== Flashing Promo Banner =====
(function() {
    const banner = document.getElementById('promoBanner');
    if (!banner) return;

    fetch(SHEET_URL + '?action=data&t=' + Date.now())
        .then(r => r.json())
        .then(data => {
            const activePromos = (data.promos || []).filter(p => String(p.Active).toLowerCase() === 'yes');
            if (activePromos.length === 0) return;

            const promo = activePromos[0];
            const srp = Number(promo.SrpPrice) || 0;
            const regular = Number(promo.RegularPrice) || 0;
            const promoPrice = Number(promo.PromoPrice) || 0;

            document.getElementById('promoBrandLabel').textContent = promo.Brand || '';
            document.getElementById('promoModelLabel').textContent = promo.Model || '';

            if (srp > 0) {
                document.getElementById('promoSrpLabel').textContent = '₱' + srp.toLocaleString();
            }
            if (srp > 0 && promoPrice > 0) {
                const savings = srp - promoPrice;
                document.getElementById('promoSaveLabel').textContent = 'Save ₱' + savings.toLocaleString();
            }
            if (promoPrice > 0) {
                document.getElementById('promoPriceLabel').textContent = '₱' + promoPrice.toLocaleString();
            }
            document.getElementById('promoMsgLabel').textContent = promo.Message || '';

            banner.style.display = 'flex';
        })
        .catch(() => {});
})();

function closePromo() {
    document.getElementById('promoBanner').style.display = 'none';
}