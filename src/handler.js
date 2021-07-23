const { nanoid } = require('nanoid');
const books = require('./books');

//*handler untuk menambahkan buku (method post)
const addBookHandler = (request, h) => {
  // Mendefinisikan semua payload ke dalam variabel
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  // Jika user/frontend tidak mengirimkan properti 'name'
  if (!name) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }

  // Jika user/frontend mengirimkan properti readPage yang lebih besar dari pageCount
  if (pageCount < readPage) {
    const response = h.response({
      status: 'fail',
      message:
        'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }

  // Mencari tahu apakah buku sudah selesai dibaca atau belum
  let finished = false;
  if (pageCount === readPage) {
    finished = true;
  }

  // Mendefinisikan nilai id, insertedAt, dan updatedAt
  const id = nanoid(16);
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  // Menyimpan semua nilai properti ke dalam objek newBook dan memasukkannya ke dalam array books
  const newBook = {
    id,
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    finished,
    reading,
    insertedAt,
    updatedAt,
  };

  books.push(newBook);

  // Jika input data berhasil
  const isSuccess = books.filter((book) => book.id === id).length > 0;

  if (isSuccess) {
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id,
        name: name,
        year: year,
        author: author,
        summary: summary,
        publisher: publisher,
        pageCount: pageCount,
        readPage: readPage,
        finished: finished,
        reading: reading,
        insertedAt: insertedAt,
        updatedAt: updatedAt,
      },
    });
    response.code(201);
    return response;
  }

  // Jika input data gagal
  const response = h.response({
    status: 'fail',
    message: 'Buku gagal ditambahkan',
  });
  response.code(400);
  return response;
};

//*handler untuk menampilkan seluruh buku
const getAllBooksHandler = (request, h) => {
  //Mengambil data dari query url
  const { name, reading, finished } = request.query;
  //Memfilter buku berdasarkan query url,
  const booksFiltered = books.filter((book) => {
    //jika query name terdefinisikan, filter buku berdasarkan nama
    if (name) return book.name.toLowerCase().includes(name.toLowerCase());

    //jika query reading terdefinisikan, filter buku berdasarkan reading,
    if (reading)
      return reading === '0' || reading === '1'
        ? book.reading === (reading === '1')
        : book;

    //jika query finished terdefinisikan, filter buku berdasarkan nilai finished
    if (finished)
      return finished === '0' || finished === '1'
        ? book.finished === (finished === '1')
        : book;

    //jika query name,reading,dan finished tidak terdefinisikan, tampilkan semua buku
    return book;
  });

  //menerapkan array mapping terhadap buku yang sudah terfilter
  const booksToBeShown = booksFiltered.map((book) => ({
    id: book.id,
    name: book.name,
    publisher: book.publisher,
  }));

  //Mengembalikan response status dan buku yang telah difilter
  return h.response({
    status: 'success',
    data: {
      books: booksToBeShown,
    },
  });
};

//*handler untuk menampilkan buku berdasarkan id
const getBookByIdHandler = (request, h) => {
  //Mengambil id dari parameter
  const { id } = request.params;

  //memfilter buku berdasarkan id
  const book = books.filter((b) => b.id === id)[0];

  //Jika buku ditemukan, return data buku
  if (book) {
    return {
      status: 'success',
      data: { book },
    };
  }

  //Jika buku tidak ditemukan
  const response = h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan',
  });
  response.code(404);
  return response;
};

//*handler untuk memperbarui buku berdasarkan id
const updateBookByIdHandler = (request, h) => {
  //Mengambil id dari parameter
  const { id } = request.params;
  //Mengambil data dari payload yang dikirim
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;
  // Jika user/frontend tidak mengirimkan properti 'name'
  if (!name) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }

  // Jika user/frontend mengirimkan properti readPage yang lebih besar dari pageCount
  if (pageCount < readPage) {
    const response = h.response({
      status: 'fail',
      message:
        'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }

  //Jika semua kriteria terpenuhi untuk meng-update data
  const updatedAt = new Date().toISOString();

  //Mencari index dari buku dengan id dalam array books
  const index = books.findIndex((book) => book.id === id);

  //Meng-update data buku
  if (index !== -1) {
    books[index] = {
      ...books[index],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
      updatedAt,
    };

    const response = h.response({
      status: 'success',
      message: 'Buku berhasil diperbarui',
    });
    response.code(200);
    return response;
  }

  //Jika terjadi kesalahan
  const response = h.response({
    status: 'fail',
    message: 'Gagal memperbarui buku. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

//*handler untuk menghapus buku berdasarkan id
const deleteBookByIdHandler = (request, h) => {
  //Mengambil id berdasarkan parameter
  const { id } = request.params;
  //Mencari index dari buku dengan id dalam array books
  const index = books.findIndex((book) => book.id === id);

  //Jika id ditemukan, hapus buku
  if (index !== -1) {
    books.splice(index, 1);

    const response = h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    });
    response.code(200);
    return response;
  }
  //Jika id tidak ditemukan
  const response = h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

module.exports = {
  addBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  updateBookByIdHandler,
  deleteBookByIdHandler,
};
