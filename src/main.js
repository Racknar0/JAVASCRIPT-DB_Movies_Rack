const api = axios.create({
    baseURL: 'https://api.themoviedb.org/3/',
    headers: {
        'Content-Type': 'application/json;charset=utf-8',
    },
    params: {
        api_key: API_KEY,
    },
});

function likedMoviesList(){
    return localStorage.getItem('likedMovies') ? JSON.parse(localStorage.getItem('likedMovies')) : {};
}


function likeMovie(movie) {
    const likedMovies = likedMoviesList();
    likedMovies[movie.id] = likedMovies[movie.id] ? likedMovies[movie.id] = undefined : likedMovies[movie.id] = movie;
    localStorage.setItem('likedMovies', JSON.stringify(likedMovies));
    validateLocalStorage()
}


function validateLocalStorage() {
    const localStorageData = JSON.stringify(localStorage);
    if (localStorageData !== validateLocalStorage.prevData) {
      console.log("Local Storage changed");
      validateLocalStorage.prevData = localStorageData;
      getLikedMovies()
    }
  }


// Utils}

const lazyLoader = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            /* console.log(entry) */
            const url = entry.target.getAttribute('data-img');
            entry.target.setAttribute('src', url);
        }
    });
});

function createMovies(movies, container, { lazyLoad = false, clean = true }) {
    if (clean) {
        container.innerHTML = '';
    }

    movies.forEach((movie) => {
        const movieContainer = document.createElement('div');
        movieContainer.classList.add('movie-container');
        const movieImg = document.createElement('img');
        movieImg.classList.add('movie-img');
        movieImg.setAttribute('alt', movie.title);

        movieImg.setAttribute(
            lazyLoad ? 'data-img' : 'src',
            'https://image.tmdb.org/t/p/w300' + movie.poster_path
        );
        /*     movieImg.setAttribute(
      'src',
      'https://image.tmdb.org/t/p/w300' + movie.poster_path,
      ); */

        movieImg.addEventListener('click', () => {
        location.hash = '#movie=' + movie.id;
         });
        movieImg.addEventListener('error', () => {
            movieImg.setAttribute('src', 'https://via.placeholder.com/300x450');
        });

        const movieBtn = document.createElement('button');
        movieBtn.classList.add('movie-btn');



        /* likedMoviesList()[movie.id] && movieBtn.classList.add('movie-btn--liked'); */
        if(likedMoviesList()[movie.id] === undefined){
            movieBtn.classList.remove('movie-btn--liked');
        }else{
            movieBtn.classList.add('movie-btn--liked');
        }

        movieBtn.addEventListener('click', (e) => {
          movieBtn.classList.toggle('movie-btn--liked');
          likeMovie(movie)
        });

        if (lazyLoad) {
            lazyLoader.observe(movieImg);
        }


        movieContainer.appendChild(movieBtn);
        movieContainer.appendChild(movieImg);
        container.appendChild(movieContainer);
    });
}

function createCategories(categories, container) {
    container.innerHTML = '';

    categories.forEach((category) => {
        const categoryContainer = document.createElement('div');
        categoryContainer.classList.add('category-container');

        const categoryTitle = document.createElement('h3');
        categoryTitle.classList.add('category-title');
        categoryTitle.setAttribute('id', 'id' + category.id);
        categoryTitle.addEventListener('click', () => {
            location.hash = `#category=${category.id}-${category.name}`;
        });
        const categoryTitleText = document.createTextNode(category.name);

        categoryTitle.appendChild(categoryTitleText);
        categoryContainer.appendChild(categoryTitle);
        container.appendChild(categoryContainer);
    });
}

// Llamados a la API

async function getTrendingMoviesPreview() {
    const { data } = await api('trending/movie/day');
    setTimeout(() => {
        const movies = data.results;
        console.log(movies);
        createMovies(movies, trendingMoviesPreviewList, { lazyLoad: true });
    }, 3000);
}

async function getCategegoriesPreview() {
    const { data } = await api('genre/movie/list');
    setTimeout(() => {
        const categories = data.genres;

        createCategories(categories, categoriesPreviewList);
    }, 3000);
}

async function getMoviesByCategory(id) {
    const { data } = await api('discover/movie', {
        params: {
            with_genres: id,
        },
    });
    const movies = data.results;
    maxPage = data.total_pages;

    createMovies(movies, genericSection,  { lazyLoad: true });
}


function getPaginatedMoviesByCategory(id) {
  return async function () {
      const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
      const scrollIsBotton = (scrollTop + clientHeight) >= scrollHeight - 15;

      const pagesIsNotMax = page < maxPage;

      if (scrollIsBotton && pagesIsNotMax) {
        const { data } = await api('discover/movie', {
          params: {
              with_genres: id,
              page: ++page,
          },
        });
        const movies = data.results;
        maxPage = data.total_pages;
        console.log('maxPage', maxPage);
        createMovies(movies, genericSection, { lazyLoad: true, clean: false });
      }
  }
}





async function getMoviesBySearch(query) {
    const { data } = await api('search/movie', {
        params: {
            query,
        },
    });
    const movies = data.results;
    maxPage = data.total_pages;
    console.log('maxPage', maxPage);
    createMovies(movies, genericSection,  { lazyLoad: true });
}


function getPaginatedMoviesBySearch(query) {
  return async function () {
      const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
      const scrollIsBotton = (scrollTop + clientHeight) >= scrollHeight - 15;

      const pagesIsNotMax = page < maxPage;

      if (scrollIsBotton && pagesIsNotMax) {
        const { data } = await api('search/movie', {
          params: {
                query,
                page: ++page,
            },
        });
        const movies = data.results;
        maxPage = data.total_pages;
        console.log('maxPage', maxPage);
        createMovies(movies, genericSection, { lazyLoad: true, clean: false });
      }
  }
}

async function getTrendingMovies() {

    const { data } = await api('trending/movie/day');
    const movies = data.results;
    console.log('getTrendingMovies', data);
    maxPage = data.total_pages;

    setTimeout(() => {
        createMovies(movies, genericSection,  { lazyLoad: true });
    }, 3000);
}

/* window.addEventListener('scroll', getPaginatedTrendingMovies); */
 
async function getPaginatedTrendingMovies() {

    const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
    const scrollIsBotton = (scrollTop + clientHeight) >= scrollHeight - 15;

    const pagesIsNotMax = page < maxPage;

    if (scrollIsBotton && pagesIsNotMax) {
      const { data } = await api('trending/movie/day', {
        params: {
              page: ++page,
          },
      });
      console.log('getPaginatedTrendingMovies', data);
      const movies = data.results;
      createMovies(movies, genericSection, { lazyLoad: true, clean: false });
    }
}

async function getMovieById(id) {
    const { data: movie } = await api('movie/' + id);

    const movieImgUrl = 'https://image.tmdb.org/t/p/w500' + movie.poster_path;
    console.log(movieImgUrl);
    headerSection.style.background = `
    linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.35) 19.27%,
      rgba(0, 0, 0, 0) 29.17%
    ),
    url(${movieImgUrl})
  `;

    movieDetailTitle.textContent = movie.title;
    movieDetailDescription.textContent = movie.overview;
    movieDetailScore.textContent = movie.vote_average;

    createCategories(movie.genres, movieDetailCategoriesList);

    getRelatedMoviesId(id);
}

/* document.documentElement.scrollTop + document.documentElement.clientHeight >= document.documentElement.scrollHeight - 15 */

async function getRelatedMoviesId(id) {
    const { data } = await api(`movie/${id}/recommendations`);
    const relatedMovies = data.results;

    createMovies(relatedMovies, relatedMoviesContainer , { lazyLoad: true });
}


function getLikedMovies() {
    const likedMovies = likedMoviesList();
    const LikedMoviesArr = Object.values(likedMovies);

    createMovies(LikedMoviesArr, likedMoviesListContainer, { lazyLoad: true , clean: true });
}