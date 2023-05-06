import React, { Component } from 'react';
import { Pagination, Input, Spin, Alert, Tabs, Space } from 'antd';
import { format } from 'date-fns';
import { enGB } from 'date-fns/locale/en-GB/index.js';
import debounce from 'lodash.debounce';

import MovieServise from '../../services/movie-service.js';
import { MovieProvider } from '../../services/movie-service-context.js';
import CardList from '../Card-list/Card-list.js';

import './App.css';
import noImage from './img/not-found.jpg';

const movieList = new MovieServise();

export default class App extends Component {
  state = {
    value: '',
    genreList: [],
    movies: [],
    ratedMovies: [],
    load: true,
    error: false,
    popular: false,
    page: '1',
    totalPages: '1',
    tab: 'search',
    sessionID: localStorage.getItem('sessionID'),
    ratedPage: '1',
    totalRatedPages: '1',
    starsInfo: null,
  };

  componentDidMount() {
    this.rateStorage = new Map();
    this.getTabs();

    const { sessionID, ratedPage } = this.state;
    try {
      if (!sessionID) {
        movieList.guestSession().then((res) => this.rememberSessionID(res.guest_session_id));
      }
      if (sessionID) {
        this.getRatedMovies(sessionID, ratedPage);
      }
      movieList.getGenreList().then((res) => this.addGenreList(res));

      movieList.getPopularMovies(this.state.page).then((res) => this.getPopularMovies(res));
    } catch (err) {
      this.setState({ error: true });
    }
  }

  componentDidUpdate(prevProps, prevState) {
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
      this.getRatedMovies(this.state.sessionID, this.state.ratedPage);
    }

    if (this.state.starsInfo !== prevState.starsInfo && this.state.starsInfo !== null) {
      movieList.getPopularMovies(this.state.page).then((res) => this.getPopularMovies(res));
    }
  }

  getPopularMovies = (list) => {
    let { results, total_pages } = list;
    if (total_pages > 500) {
      total_pages = 500;
    }
    const newMovieList = [];

    results.map((movie) => {
      const newMovie = this.createMovie(movie);
      newMovieList.push(newMovie);
    });

    this.setState({
      movies: newMovieList,
      load: false,
      totalPages: total_pages,
      popular: true,
    });
  };

  addRateToStorage(id, rate) {
    this.rateStorage.set(id, rate);
  }

  createMovie(item) {
    const { starsInfo } = this.state;

    let getRate = 0;
    if (starsInfo) {
      getRate = starsInfo.get(item.id);
      console.log(getRate);
    }

    const rate = item.rating ? item.rating : getRate;

    const obj = {
      title: item.title,
      date: this.convertDate(item.release_date),
      tags: item.genre_ids,
      description: this.cutDescription(item.overview, item.genre_ids),
      rating: Number(item.vote_average.toFixed(1)),
      picture: this.getPicture(item.poster_path),
      id: item.id,
      stars: rate,
    };

    return obj;
  }

  addMovie(page) {
    let movieData;

    movieData = movieList.getMovies(this.state.value, page);

    movieData
      .then((elem) => {
        const { results, total_pages } = elem;
        const newMovieList = [];

        results.map((movie) => {
          const newMovie = this.createMovie(movie);
          newMovieList.push(newMovie);
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

  getPicture(path) {
    if (path !== null && path !== undefined) {
      return `https://image.tmdb.org/t/p/original${path}`;
    }
    return noImage;
  }

  cutDescription(text, genres) {
    if (text.length > 150) {
      if (genres.length < 3) {
        let cutText = text.slice(0, 200).split(' ');
        cutText.pop();
        cutText = cutText.join(' ');
        return cutText + ' ...';
      } else if (genres.length <= 4) {
        let cutText = text.slice(0, 130).split(' ');
        cutText.pop();
        cutText = cutText.join(' ');
        return cutText + ' ...';
      } else {
        let cutText = text.slice(0, 100).split(' ');
        cutText.pop();
        cutText = cutText.join(' ');
        return cutText + ' ...';
      }
    }
    return text;
  }

  convertDate(date) {
    if (date) {
      return format(new Date(date), 'MMMM dd, yyyy', { locale: enGB });
    }
  }

  changeSearchQuery = (evt) => {
    if (evt.target.value.trim() !== '') {
      this.setState({
        value: evt.target.value,
      });
    }
    this.addMovie(this.state.page);
  };

  changePagination = (clickPage) => {
    this.setState({ page: clickPage });
  };

  changeRatedPagination = (clickPage) => {
    this.setState({ ratedPage: clickPage });
  };

  getTabs = () => {
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
    return items;
  };

  onTabChange = (key) => {
    const { sessionID, ratedPage, page } = this.state;
    if (key === '2') {
      this.setState({ tab: 'rated' });
      this.getRatedMovies(sessionID, ratedPage);
    } else {
      this.setState({ tab: 'search' });
      movieList.getPopularMovies(page).then((res) => this.getPopularMovies(res));
    }
  };

  rememberSessionID = (id) => {
    if (!localStorage.getItem('sessionID')) {
      localStorage.setItem('sessionID', id);
      this.setState({ sessionID: id });
    }
  };
  addGenreList = (list) => {
    const { genres } = list;
    this.setState({ genreList: genres });
  };

  getRatedMovies = async (id, pageNum) => {
    const ratedList = await movieList.getRatedMovies(id, pageNum);
    const { results, page, total_pages } = ratedList;

    const addMovie = this.addRatedMovies(results);
    this.setState({ ratedMovies: addMovie, ratedPage: page, totalRatedPages: total_pages });
  };

  addRatedMovies = (list) => {
    const movieList = [];

    list.map((movie) => {
      const { id, rating } = movie;
      this.addRateToStorage(id, rating);
      const newMovie = this.createMovie(movie);
      movieList.push(newMovie);
    });
    this.setState({ starsInfo: this.rateStorage });
    return movieList;
  };

  render() {
    const { load, error, movies, page, totalPages, ratedPage, ratedMovies, genreList, totalRatedPages, starsInfo } =
      this.state;
    const context = { genreList, movieList, starsInfo, ratedMovies };

    const isError = error ? <Alert message="Warning! Something is wrong. " type="error" showIcon closable /> : null;
    const isLoad = load ? (
      <Spin tip="Loading...">
        <Alert message="Loading movie list" description="Please, wait" type="info" />
      </Spin>
    ) : (
      <CardList props={movies} />
    );
    const isEmpty =
      !load && !error && movies.length === 0 ? (
        <Alert message="Empty movie list" description="There is no movies, please, try again" type="info" />
      ) : null;

    const activeTab =
      this.state.tab === 'search' ? (
        <React.Fragment>
          <div className="app__search-input">
            <Input required placeholder={'Type to search'} onChange={debounce(this.changeSearchQuery, 600)} />
          </div>
          <Space />
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
          <CardList props={ratedMovies} />
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
            items={this.getTabs()}
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