let jobs = [];
let editId = null;

const statusClass = {
    Applied: 's-applied', Interview: 's-interview', Offer: 's-offer',
    Rejected: 's-rejected', Withdrawn: 's-withdrawn', Ghosted: 's-ghosted'
};

function load() {
    try { jobs = JSON.parse(localStorage.getItem('jt_jobs') || '[]'); } catch (e) { jobs = []; }
}
function save() {
    try { localStorage.setItem('jt_jobs', JSON.stringify(jobs)); } catch (e) { }
}

function openModal(id) {
    editId = id || null;
    document.getElementById('modal-title').textContent = id ? 'Edit application' : 'Add application';
    const j = id ? jobs.find(x => x.id === id) : null;
    document.getElementById('f-company').value = j ? j.company : '';
    document.getElementById('f-role').value = j ? j.role : '';
    document.getElementById('f-status').value = j ? j.status : 'Applied';
    document.getElementById('f-date').value = j ? j.date : new Date().toISOString().slice(0, 10);
    document.getElementById('f-salary').value = j ? j.salary : '';
    document.getElementById('f-url').value = j ? j.url : '';
    document.getElementById('f-notes').value = j ? j.notes : '';
    document.getElementById('modal-bg').classList.add('open');
    setTimeout(() => document.getElementById('f-company').focus(), 50);
}

function closeModal() { document.getElementById('modal-bg').classList.remove('open'); }

function saveEntry() {
    const company = document.getElementById('f-company').value.trim();
    const role = document.getElementById('f-role').value.trim();
    if (!company || !role) { alert('Company and role are required.'); return; }
    const entry = {
        id: editId || Date.now().toString(),
        company, role,
        status: document.getElementById('f-status').value,
        date: document.getElementById('f-date').value,
        salary: document.getElementById('f-salary').value.trim(),
        url: document.getElementById('f-url').value.trim(),
        notes: document.getElementById('f-notes').value.trim()
    };
    jobs = editId ? jobs.map(j => j.id === editId ? entry : j) : [entry, ...jobs];
    save(); closeModal(); render();
}

function deleteEntry(id) {
    if (!confirm('Remove this application?')) return;
    jobs = jobs.filter(j => j.id !== id);
    save(); render();
}

function fmt(d) {
    if (!d) return '—';
    const [y, m, dy] = d.split('-');
    return `${parseInt(m)}/${parseInt(dy)}/${y.slice(2)}`;
}

function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderStats() {
    const c = {};
    jobs.forEach(j => c[j.status] = (c[j.status] || 0) + 1);
    document.getElementById('stats').innerHTML = [
        { label: 'Total', value: jobs.length },
        { label: 'Interviews', value: c['Interview'] || 0 },
        { label: 'Offers', value: c['Offer'] || 0 },
        { label: 'Rejected', value: c['Rejected'] || 0 },
    ].map(s => `<div class="stat"><div class="stat-label">${s.label}</div><div class="stat-value">${s.value}</div></div>`).join('');
}

function render() {
    renderStats();
    const q = document.getElementById('search').value.toLowerCase();
    const sf = document.getElementById('filter-status').value;
    const filtered = jobs.filter(j =>
        (!q || j.company.toLowerCase().includes(q) || j.role.toLowerCase().includes(q)) &&
        (!sf || j.status === sf)
    );
    const tbody = document.getElementById('tbody');
    const empty = document.getElementById('empty');
    if (!filtered.length) { tbody.innerHTML = ''; empty.style.display = 'block'; return; }
    empty.style.display = 'none';
    tbody.innerHTML = filtered.map(j => `
    <tr>
      <td class="col-company" style="font-weight:500">${esc(j.company)}</td>
      <td class="col-role">${esc(j.role)}</td>
      <td class="col-status"><span class="badge ${statusClass[j.status] || ''}">${esc(j.status)}</span></td>
      <td class="col-date" style="color:var(--text2)">${fmt(j.date)}</td>
      <td class="col-salary" style="color:var(--text2)">${esc(j.salary) || '—'}</td>
      <td class="col-notes" style="color:var(--text2);font-size:13px">${j.notes ? esc(j.notes.slice(0, 60)) + (j.notes.length > 60 ? '…' : '') : '—'}</td>
      <td class="col-actions"><div class="actions">
        ${j.url ? `<button onclick="window.open('${esc(j.url)}','_blank')" title="Open listing"><i class="ti ti-external-link"></i></button>` : ''}
        <button onclick="openModal('${j.id}')" title="Edit"><i class="ti ti-edit"></i></button>
        <button onclick="deleteEntry('${j.id}')" title="Delete"><i class="ti ti-trash"></i></button>
      </div></td>
    </tr>`).join('');
}

function exportCSV() {
    const headers = ['Company', 'Role', 'Status', 'Date Applied', 'Salary', 'URL', 'Notes'];
    const rows = jobs.map(j => [j.company, j.role, j.status, j.date, j.salary, j.url, j.notes]
        .map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'job-applications.csv';
    a.click();
}
function triggerImport() {
    const input = document.getElementById('csv-import');
    input.value = '';
    input.click();
}

function importCSV(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
        const lines = e.target.result.split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length < 2) { alert('No data found in CSV.'); return; }
        const headers = parseCSVRow(lines[0]).map(h => h.toLowerCase().replace(/\s+/g, ''));
        const idx = {
            company: headers.indexOf('company'),
            role: headers.indexOf('role'),
            status: headers.indexOf('status'),
            date: headers.indexOf('dateapplied'),
            salary: headers.indexOf('salary'),
            url: headers.indexOf('url'),
            notes: headers.indexOf('notes'),
        };
        if (idx.company === -1 || idx.role === -1) {
            alert('CSV must have at least "Company" and "Role" columns.');
            return;
        }
        const validStatuses = ['Applied', 'Interview', 'Offer', 'Rejected', 'Withdrawn', 'Ghosted'];
        let imported = 0, skipped = 0;
        lines.slice(1).forEach(line => {
            const cols = parseCSVRow(line);
            const company = cols[idx.company]?.trim();
            const role = cols[idx.role]?.trim();
            if (!company || !role) { skipped++; return; }
            const status = validStatuses.includes(cols[idx.status]) ? cols[idx.status] : 'Applied';
            const entry = {
                id: Date.now().toString() + Math.random().toString(36).slice(2),
                company, role, status,
                date: idx.date !== -1 ? cols[idx.date]?.trim() || '' : '',
                salary: idx.salary !== -1 ? cols[idx.salary]?.trim() || '' : '',
                url: idx.url !== -1 ? cols[idx.url]?.trim() || '' : '',
                notes: idx.notes !== -1 ? cols[idx.notes]?.trim() || '' : '',
            };
            jobs.unshift(entry);
            imported++;
        });
        save(); render();
        alert(`Imported ${imported} application${imported !== 1 ? 's' : ''}${skipped ? `, skipped ${skipped} invalid row${skipped !== 1 ? 's' : ''}` : ''}.`);
    };
    reader.readAsText(file);
}

function parseCSVRow(line) {
    const cols = [];
    let cur = '', inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
            if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
            else inQuotes = !inQuotes;
        } else if (ch === ',' && !inQuotes) {
            cols.push(cur); cur = '';
        } else {
            cur += ch;
        }
    }
    cols.push(cur);
    return cols;
}

document.getElementById('modal-bg').addEventListener('click', e => {
    if (e.target === document.getElementById('modal-bg')) closeModal();
});
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
});

load(); render();