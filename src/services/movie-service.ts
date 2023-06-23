export default class MovieServise {
  _baseUrl: string;
  _apiKey: string;

  constructor() {
    this._baseUrl = 'https://api.themoviedb.org/3';
    this._apiKey = '636c0c0b02f087caae4fc8bbe451fc61';
  }
  async getResourse(url: string) {
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Status code: ${res.status}`);
    }

    const data = await res.json();
    return data;
  }

  async getMovies(query = 'return', page = 1) {
    const movieList = this.getResourse(
      `${this._baseUrl}/search/movie?api_key=${this._apiKey}&language=en-US&query=${query}&page=${page}`
    );
    return movieList;
  }

  async guestSession() {
    const guestSession = this.getResourse(`${this._baseUrl}/authentication/guest_session/new?api_key=${this._apiKey}`);
    return guestSession;
  }

  async getRatedMovies(sessionID: string, page = 1) {
    const url = `${this._baseUrl}/guest_session/${sessionID}/rated/movies?api_key=${this._apiKey}&page=${page}`;

    const ratedMovies = this.getResourse(url);
    return ratedMovies;
  }

  async getGenreList() {
    const genreList = this.getResourse(`${this._baseUrl}/genre/movie/list?api_key=${this._apiKey}`);

    return genreList;
  }

  async sendMovieRate(movieID: string, sessionID: string, rate: number) {
    const url = `${this._baseUrl}/movie/${movieID}/rating?api_key=${this._apiKey}&guest_session_id=${sessionID}`;

    const body = {
      //prettier-ignore
      'value': `${rate}`,
    };

    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json;charset=utf-8' },
      body: JSON.stringify(body),
    }).catch((err) => {
      throw new Error(`Status code: ${err.name}`);
    });
  }

  async deleteRateMovie(movieID: string, sessionID: string) {
    const url = `${this._baseUrl}/movie/${movieID}/rating?api_key=${this._apiKey}&guest_session_id=${sessionID}`;
    await fetch(url, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json;charset=utf-8' },
    }).catch((err) => {
      throw new Error(`Status code: ${err.name}`);
    });
  }

  async getPopularMovies(page: number) {
    const popularList = await this.getResourse(
      `${this._baseUrl}/movie/popular?api_key=${this._apiKey}&language=en-US&page=${page}`
    ).catch((err) => {
      throw new Error(`Status code: ${err.name}`);
    });
    return popularList;
  }
}
