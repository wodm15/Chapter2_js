document.addEventListener('DOMContentLoaded', async function () {
    // 필요한 요소들을 가져옴
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const movieContainer = document.getElementById('movieContainer');
    const apiKey = '74ff6e1f9c4702bf2cdb221fbfb25dd1';
    const homeButton = document.getElementById('homeButton');
    const popup = document.getElementById('popup');

    // 검색 입력란에 포커스 설정
    searchInput.focus();
    searchInput.select();

    // 영화 검색 함수
    async function searchMovies(query) {
        const apiUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}`;

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            if (data && data.results) {
                displayMovies(data.results);
            } else {
                console.error('Invalid data format:', data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    // 검색 버튼 클릭 시 이벤트 처리
    searchButton.addEventListener('click', async () => {
        const query = searchInput.value;
        if (query.trim() !== '') {
            await searchMovies(query);
        } else {
            alert('검색어를 입력해주세요.');
        }
    });

    // 검색 입력란에서 Enter 키 입력 시 이벤트 처리
    searchInput.addEventListener('keypress', async function (event) {
        if (event.key === 'Enter') {
            const query = searchInput.value;
            if (query.trim() !== '') {
                await searchMovies(query);
            } else {
                alert('검색어를 입력해주세요.');
            }
        }
    });

    // 최고 평점 영화 가져오기
    await fetchTopRatedMovies();

    async function fetchTopRatedMovies() {
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3NGZmNmUxZjljNDcwMmJmMmNkYjIyMWZiZmIyNWRkMSIsInN1YiI6IjY2MjlmYjZlZDRkNTA5MDBiYWUxYzA5NyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.lbUa6FD-agpIhx51LHDy1A_0Lw31npAO5cGtrHhMix8'
            }
        };

        try {
            const response = await fetch('https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=1', options);
            const data = await response.json();
            if (data && data.results) {
                displayMovies(data.results);
            } else {
                console.error('Invalid data format:', data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    // 영화 목록 표시
    function displayMovies(movies) {
        movieContainer.innerHTML = '';

        movies.forEach(movie => {
            const movieCard = createMovieCard(movie);
            movieContainer.appendChild(movieCard);
        });
    }

    
    // 영화 카드 생성
    function createMovieCard(movie) {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movieCard');

        const image = document.createElement('img');
        image.src = movie.poster_path ? `https://image.tmdb.org/t/p/w500/${movie.poster_path}` : '이미지가 없을 때 대체할 이미지 경로';
        image.alt = movie.title;

        const movieInfo = document.createElement('div');
        movieInfo.classList.add('movieInfo');

        const title = document.createElement('h2');
        title.textContent = movie.title;

        const overview = document.createElement('p');
        overview.textContent = movie.overview;

        movieInfo.appendChild(title);
        movieInfo.appendChild(overview);

        movieCard.appendChild(image);
        movieCard.appendChild(movieInfo);

        image.addEventListener('click', () => {
            openPopup(movie.id);
        });

        return movieCard;
    }

    // 팝업 열기
    function openPopup(movieId) {
        popup.style.display = 'block';
        const popupImg = document.getElementById('popupImg');
        const popupTitle = document.getElementById('popupTitle');
        const popupReleaseDate = document.getElementById('popupReleaseDate');
        const popupGenres = document.getElementById('popupGenres');
        const popupOverview = document.getElementById('popupOverview');

        // 영화 상세 정보 가져오기
        const movieDetailsUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=en-US`;
        fetch(movieDetailsUrl)
            .then(response => response.json())
            .then(data => {
                popupImg.src = `https://image.tmdb.org/t/p/w500/${data.poster_path}`;
                popupTitle.textContent = data.title;
                popupReleaseDate.textContent = " " + data.release_date;
                popupGenres.textContent = " " + data.genres.map(genre => genre.name).join(', ');
                popupOverview.textContent = " " + data.overview;

            //////// 로컬 스토리지 구현 부분
            const commentForm = document.getElementById('commentForm');
            const submitComment = document.getElementById('submitComment');

            displayComments(movieId);  //이전 댓글 보여주기 

            submitComment.addEventListener('click', function(event) {
                
            // //댓글 5개 제한
            // if (movieComments && movieId.comment > 5){
            //     alert('댓글은 5개까지');
            //     return;
            // }

            //입력값 가져오기
            const userId = document.getElementById('userId').value.trim();
            const password = document.getElementById('password').value.trim();
            const comment = document.getElementById('commentContent').value.trim();


            // 현재 영화의 댓글 목록 가져오기
            let movieComments = JSON.parse(localStorage.getItem(movieId)) || [];

            // 댓글을 저장할 객체 생성
            const newComment = {
            userId: userId,
            password: password,
            comment: comment
            };

            movieComments.push(newComment);

            // 로컬 스토리지에 댓글 저장
            localStorage.setItem(movieId, JSON.stringify(movieComments)); // movieId를 키로 사용

            displayComments(movieId);

            });


        // 댓글 보여주는 함수
        function displayComments(movieId) {
            const movieComments = JSON.parse(localStorage.getItem(movieId));
            console.log(movieId);
            console.log(movieComments);

            //댓글이 있는 경우
            if (movieComments && movieComments.length > 0) {
            commentDisplay.innerHTML = '';
            movieComments.forEach(comment => {
            const commentElement = document.createElement('p');
            commentElement.textContent=comment.comment;
            commentDisplay.appendChild(commentElement);
        });
    
            // 댓글이 없는 경우
            } else {
            commentDisplay.innerHTML = '등록된 댓글이 없습니다.';
            }
        };


        //////// 로컬 스토리지 구현 부분 끝

            })
            .catch(error => {
                console.error('Error fetching movie details:', error);
            });
    }

    // 팝업 닫기
    function closePopup() {
        popup.style.display = 'none';
    }

    // HOME 버튼 클릭 시 이벤트 처리
    homeButton.addEventListener('click', async () => {
        await fetchTopRatedMovies();
    });

    // X 버튼 클릭 시 팝업 닫기
    const closePopupButton = document.querySelector('.close'); // X 버튼을 가져옴
    closePopupButton.addEventListener('click', closePopup); // X 버튼에 이벤트 핸들러 추가
});




