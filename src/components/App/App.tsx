import React, { Component } from 'react';
import { Pagination, Input, Spin, Alert, Tabs } from 'antd';
import debounce from 'lodash.debounce';

import MovieServise from '../../services/movie-service';
import { MovieProvider } from '../../services/movie-service-context';
import CardList from '../Card-list/Card-list/Card-list';

import './App.css';

const movieList = new MovieServise();

type TMovie = {
  id: string;
  rating?: string;
  title: string;
  tags?: string[];
  description?: string;
  picture?: string;
  date?: string;
  genreList?: { id: string; name: string }[];
  stars?: number;
  sessionID?: string | null;
};

type TState = {
  value: string;
  genreList: any | undefined;
  movies: TMovie[] | [];
  ratedMovies: TMovie[] | [];
  load: boolean;
  error: boolean;
  popular: boolean;
  page: number;
  totalPages: number;
  tab: string;
  sessionID: string | null;
  ratedPage: number;
  totalRatedPages: number;
};

export default class App extends Component<{}, TState> {
  state = {
    value: '',
    genreList: [],
    movies: [],
    ratedMovies: [],
    load: true,
    error: false,
    popular: false,
    page: 1,
    totalPages: 1,
    tab: 'search',
    sessionID: localStorage.getItem('sessionID'),
    ratedPage: 1,
    totalRatedPages: 1,
  };

  componentDidMount() {
    const { sessionID, ratedPage } = this.state;

    if (!sessionID) {
      movieList
        .guestSession()
        .then((res) => this.rememberSessionID(res.guest_session_id))
        .catch(() => {
          this.onError;
        });
    }

    this.getRatedMovies(sessionID!, ratedPage);

    movieList
      .getGenreList()
      .then((res) => this.addGenreList(res))
      .catch(() => this.onError);

    movieList
      .getPopularMovies(this.state.page)
      .then((res) => this.getPopularMovies(res))
      .catch(() => this.onError);
  }

  // static getDerivedStateFromError() {
  //   this.setState({ error: true, load: false });
  // }

  componentDidUpdate(prevProps: [], prevState: TState) {
    if (prevState.value !== this.state.value) {
      this.setState({ load: true });
      this.addMovie(this.state.page);
    }
    if (prevState.page !== this.state.page && this.state.popular === false) {
      this.setState({ page: this.state.page, load: true });
      this.addMovie(this.state.page);
    }
    if (prevState.page !== this.state.page && this.state.popular === true) {
      this.setState({ page: this.state.page, load: true });
      movieList.getPopularMovies(this.state.page).then((res) => this.getPopularMovies(res));
    }
    if (prevState.ratedPage !== this.state.ratedPage) {
      this.getRatedMovies(this.state.sessionID!, this.state.ratedPage);
    }

    if (this.state.ratedMovies !== prevState.ratedMovies) {
      movieList
        .getPopularMovies(this.state.page)
        .then((res) => this.getPopularMovies(res))
        .catch(() => this.onError());
    }
  }

  getPopularMovies = (list: { results: []; total_pages: number }) => {
    let { results, total_pages } = list;
    if (total_pages > 500) {
      total_pages = 500;
    }
    const newMovieList: any = [];

    const { ratedMovies } = this.state;

    results.map((movie: TMovie) => {
      const index = ratedMovies.findIndex((elem: TMovie) => elem.id === movie.id);

      let item: TMovie | undefined;
      if (index > -1) {
        item = ratedMovies[index];
      }

      const movieWithRate: TMovie = structuredClone(movie);

      if (item) {
        const rating = item.rating;
        movieWithRate.rating = rating;
      }
      newMovieList.push(movieWithRate);
    });
    this.setState({
      movies: newMovieList,
      load: false,
      totalPages: total_pages,
      popular: true,
    });
  };

  addMovie(page: number) {
    let movieData;
    movieData = movieList.getMovies(this.state.value, page);
    movieData
      .then((elem) => {
        const { results, total_pages } = elem;
        const { ratedMovies } = this.state;
        const newMovieList: any = [];

        results.map((movie: TMovie) => {
          const index = ratedMovies.findIndex((elem: { id: string }) => movie.id === elem.id);
          let item: any;

          if (index > -1) {
            item = ratedMovies[index];
          }

          const movieWithRate = structuredClone(movie);

          if (item) {
            const rating = item.rating;
            movieWithRate.rating = rating;
          }
          newMovieList.push(movieWithRate);
        });

        this.setState({
          movies: newMovieList,
          load: false,
          totalPages: total_pages,
          popular: false,
        });
      })
      .catch(this.onError);
  }

  onError = () => {
    this.setState({ error: true, load: false });
  };

  changeSearchQuery = (evt: any) => {
    if (evt.target.value.trim() !== '') {
      this.setState({
        value: evt.target.value,
      });
    }
    this.addMovie(this.state.page);
  };

  changePagination = (clickPage: number) => {
    this.setState({ page: clickPage });
  };

  changeRatedPagination = (clickPage: number) => {
    this.setState({ ratedPage: clickPage });
  };

  onTabChange = (key: string) => {
    const { sessionID, ratedPage, page } = this.state;
    if (key === '2') {
      this.setState({ tab: 'rated' });
      this.getRatedMovies(sessionID!, ratedPage);
    } else {
      this.setState({ tab: 'search' });
      movieList.getPopularMovies(page).then((res) => this.getPopularMovies(res));
    }
  };

  rememberSessionID = (id: string) => {
    if (!localStorage.getItem('sessionID')) {
      localStorage.setItem('sessionID', id);
      this.setState({ sessionID: id });
    }
  };
  addGenreList = (list: { genres: [] }) => {
    const { genres } = list;
    this.setState({ genreList: genres });
  };

  getRatedMovies = async (id: string, pageNum: number) => {
    try {
      const ratedList = await movieList.getRatedMovies(id, pageNum);
      const { results, page, total_pages } = ratedList;
      this.addRatedMovies(results);

      this.setState({ ratedPage: page, totalRatedPages: total_pages });
    } catch (err) {
      this.onError();
    }
  };

  addRatedMovies(list: []) {
    let newMovieList: any[] = [];
    list.map((movie) => {
      newMovieList.push(movie);
      this.setState({ ratedMovies: newMovieList });
    });
  }

  render() {
    const { load, error, movies, page, totalPages, ratedMovies, genreList, ratedPage, totalRatedPages, sessionID } =
      this.state;

    const context: any = { genreList, movieList, sessionID };

    const items = [
      {
        key: '1',
        label: 'Search',
      },
      {
        key: '2',
        label: 'Rated',
      },
    ];

    const isLoad = load ? (
      <Spin tip="Loading...">
        <Alert message="Loading movie list" description="Please, wait" type="info" />
      </Spin>
    ) : (
      <CardList props={movies} genreList={genreList} movieList={movieList} sessionID={sessionID} />
    );

    const isEmpty =
      !load && !error && movies.length === 0 ? (
        <Alert message="Empty movie list" description="There is no movies, please, try again" type="info" />
      ) : null;

    const isError = error ? <Alert message="Warning! Something is wrong. " type="error" showIcon closable /> : null;

    const activeTab =
      this.state.tab === 'search' ? (
        <React.Fragment>
          <div className="app__search-input">
            <Input required placeholder={'Type to search'} onChange={debounce(this.changeSearchQuery, 600)} />
          </div>
          {isError}
          {isLoad}
          {isEmpty}
          <Pagination
            className="app__pagination"
            defaultCurrent={page}
            total={totalPages * 10}
            showSizeChanger={false}
            onChange={this.changePagination}
          />
        </React.Fragment>
      ) : (
        <React.Fragment>
          <CardList props={ratedMovies} genreList={genreList} movieList={movieList} sessionID={sessionID} />;{isError}
          {isLoad}
          {isEmpty}
          <Pagination
            className="app__pagination"
            defaultCurrent={ratedPage}
            total={totalRatedPages * 10}
            showSizeChanger={false}
            onChange={this.changeRatedPagination}
          />
        </React.Fragment>
      );

    const isOnline = window.navigator.onLine ? (
      <div className="app">
        <div className="app__tabs">
          <Tabs
            centered
            defaultActiveKey="1"
            items={items}
            size={'middle'}
            destroyInactiveTabPane
            onChange={this.onTabChange}
          ></Tabs>
        </div>
        <div className="app__list">
          <MovieProvider value={context}>{activeTab}</MovieProvider>
        </div>
      </div>
    ) : (
      <Alert message="Network Error" description="Offline error. Failed to load application" type="error" />
    );

    return <React.Fragment>{isOnline}</React.Fragment>;
  }
  static defaultProps = {};
}
