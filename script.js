function initData() {
    if (!localStorage.getItem('books')) {
        const initialBooks = [
            {id: 1, title: "Belajar HTML & CSS", author: "Gamelab", status: "Tersedia"},
            {id: 2, title: "JavaScript Dasar", author: "John Doe", status: "Dipinjam"}
        ];
        localStorage.setItem('books', JSON.stringify(initialBooks));
    }

    if (!localStorage.getItem('loans')) {
        localStorage.setItem('loans', JSON.stringify([]));
    }

    if (!localStorage.getItem('members')) {
        const initialMembers = [
            {id: 1, name: "Zalman Alfarisi", address: "Makassar", joinDate: "2025-01-15"}
        ];
        localStorage.setItem('members', JSON.stringify(initialMembers));
    }
}

function getData(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
}

function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(page + '-page').classList.add('active');

    const title = document.getElementById('page-title');
    if (page === 'home') title.textContent = 'Beranda';
    else if (page === 'books') title.textContent = 'Daftar Buku';
    else if (page === 'loans') title.textContent = 'Peminjaman Buku';
    else if (page === 'members') title.textContent = 'Informasi Anggota';

    document.querySelectorAll('.sidebar li').forEach(li => li.classList.remove('active'));
    const menuItems = document.querySelectorAll('.sidebar li');
    for (let item of menuItems) {
        if (item.getAttribute('onclick').includes(page)) {
            item.classList.add('active');
            break;
        }
    }

    if (page === 'books') renderBooks();
    if (page === 'loans') renderLoans();
    if (page === 'members') renderMembers();
    if (page === 'home') updateStats();
}

function renderBooks() {
    const tbody = document.querySelector('#books-table tbody');
    tbody.innerHTML = '';
    const books = getData('books');

    books.forEach(book => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${book.id}</td>
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td><span class="status ${book.status.toLowerCase()}">${book.status}</span></td>
            <td>
                <button onclick="editBook(${book.id})" class="btn-small">Edit</button>
                <button onclick="deleteItem('books', ${book.id})" class="btn-small delete">Hapus</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function renderLoans() {
    const tbody = document.querySelector('#loans-table tbody');
    tbody.innerHTML = '';
    const loans = getData('loans');

    loans.forEach(loan => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${loan.id}</td>
            <td>${loan.memberName}</td>
            <td>${loan.bookTitle}</td>
            <td>${loan.loanDate}</td>
            <td><span class="status ${loan.status.toLowerCase()}">${loan.status}</span></td>
            <td>
                <button onclick="returnBook(${loan.id})" class="btn-small">Kembali</button>
                <button onclick="deleteItem('loans', ${loan.id})" class="btn-small delete">Hapus</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function renderMembers() {
    const tbody = document.querySelector('#members-table tbody');
    tbody.innerHTML = '';
    const members = getData('members');

    members.forEach(member => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${member.id}</td>
            <td>${member.name}</td>
            <td>${member.address}</td>
            <td>${member.joinDate}</td>
            <td>
                <button onclick="deleteItem('members', ${member.id})" class="btn-small delete">Hapus</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updateStats() {
    const books = getData('books');
    const loans = getData('loans');
    const members = getData('members');

    document.getElementById('total-books').textContent = books.length;
    document.getElementById('available-books').textContent = books.filter(b => b.status === "Tersedia").length;
    document.getElementById('borrowed-books').textContent = loans.length;
    document.getElementById('total-members').textContent = members.length;
}

function showAddBookModal() {
    document.getElementById('modal-title').textContent = "Tambah Buku Baru";
    document.getElementById('modal-body').innerHTML = `
        <input type="text" id="book-title" placeholder="Judul Buku">
        <input type="text" id="book-author" placeholder="Nama Penulis">
        <select id="book-status">
            <option value="Tersedia">Tersedia</option>
            <option value="Dipinjam">Dipinjam</option>
        </select>
        <button onclick="saveBook()" class="btn-primary">Simpan Buku</button>
    `;
    document.getElementById('modal').style.display = 'block';
}

function editBook(id) {
    const books = getData('books');
    const book = books.find(b => b.id === id);
    if (!book) return;

    document.getElementById('modal-title').textContent = "Edit Buku";
    document.getElementById('modal-body').innerHTML = `
        <input type="text" id="book-title" value="${book.title}">
        <input type="text" id="book-author" value="${book.author}">
        <select id="book-status">
            <option value="Tersedia" ${book.status === "Tersedia" ? "selected" : ""}>Tersedia</option>
            <option value="Dipinjam" ${book.status === "Dipinjam" ? "selected" : ""}>Dipinjam</option>
        </select>
        <button onclick="saveBook()" class="btn-primary">Simpan Perubahan</button>
    `;
    document.getElementById('modal').style.display = 'block';
    window.currentEditingId = id;
}

function saveBook() {
    const title = document.getElementById('book-title').value.trim();
    const author = document.getElementById('book-author').value.trim();
    const status = document.getElementById('book-status').value;

    if (!title || !author) {
        alert("Judul dan penulis tidak boleh kosong!");
        return;
    }

    let books = getData('books');

    if (window.currentEditingId) {
        const book = books.find(b => b.id === window.currentEditingId);
        if (book) {
            book.title = title;
            book.author = author;
            book.status = status;
        }
        delete window.currentEditingId;
    } else {
        const newId = books.length ? Math.max(...books.map(b => b.id)) + 1 : 1;
        books.push({ id: newId, title, author, status });
    }

    saveData('books', books);
    closeModal();
    renderBooks();
    if (document.getElementById('home-page').classList.contains('active')) updateStats();
}

function showAddLoanModal() {
    document.getElementById('modal-title').textContent = "Catat Peminjaman Baru";
    document.getElementById('modal-body').innerHTML = `
        <input type="text" id="loan-member" placeholder="Nama Peminjam">
        <input type="text" id="loan-book" placeholder="Judul Buku">
        <input type="date" id="loan-date">
        <button onclick="saveLoan()" class="btn-primary">Simpan Peminjaman</button>
    `;
    document.getElementById('modal').style.display = 'block';
}

function saveLoan() {
    const memberName = document.getElementById('loan-member').value.trim();
    const bookTitle = document.getElementById('loan-book').value.trim();
    const loanDate = document.getElementById('loan-date').value;

    if (!memberName || !bookTitle || !loanDate) {
        alert("Mohon isi semua field!");
        return;
    }

    let loans = getData('loans');
    const newId = loans.length ? Math.max(...loans.map(l => l.id)) + 1 : 1;

    loans.push({
        id: newId,
        memberName: memberName,
        bookTitle: bookTitle,
        loanDate: loanDate,
        status: "Dipinjam"
    });

    saveData('loans', loans);
    closeModal();
    renderLoans();
    if (document.getElementById('home-page').classList.contains('active')) updateStats();
}

function showAddMemberModal() {
    document.getElementById('modal-title').textContent = "Tambah Anggota Baru";
    document.getElementById('modal-body').innerHTML = `
        <input type="text" id="member-name" placeholder="Nama Lengkap">
        <input type="text" id="member-address" placeholder="Alamat">
        <input type="date" id="member-date">
        <button onclick="saveMember()" class="btn-primary">Simpan Anggota</button>
    `;
    document.getElementById('modal').style.display = 'block';
}

function saveMember() {
    const name = document.getElementById('member-name').value.trim();
    const address = document.getElementById('member-address').value.trim();
    const joinDate = document.getElementById('member-date').value;

    if (!name || !address || !joinDate) {
        alert("Mohon isi semua field!");
        return;
    }

    let members = getData('members');
    const newId = members.length ? Math.max(...members.map(m => m.id)) + 1 : 1;

    members.push({
        id: newId,
        name: name,
        address: address,
        joinDate: joinDate
    });

    saveData('members', members);
    closeModal();
    renderMembers();
    if (document.getElementById('home-page').classList.contains('active')) updateStats();
}

function returnBook(id) {
    if (confirm("Apakah buku ini sudah dikembalikan?")) {
        let loans = getData('loans');
        const loan = loans.find(l => l.id === id);
        if (loan) loan.status = "Dikembalikan";
        saveData('loans', loans);
        renderLoans();
    }
}

function deleteItem(type, id) {
    if (!confirm("Yakin ingin menghapus data ini?")) return;

    let data = getData(type);
    data = data.filter(item => item.id !== id);
    saveData(type, data);

    if (type === 'books') renderBooks();
    if (type === 'loans') renderLoans();
    if (type === 'members') renderMembers();
    if (document.getElementById('home-page').classList.contains('active')) updateStats();
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

initData();
showPage('home');