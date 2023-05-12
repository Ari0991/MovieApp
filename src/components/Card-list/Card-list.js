import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { enGB } from 'date-fns/locale/en-GB/index.js';

import { MovieConsumer } from '../../services/movie-service-context.js';
import CardItem from '../Card-item/Card-item.js';
import './Card-list.css';

import noImage from './img/not-found.jpg';

export default class CardList extends Component {
  createMovie(item) {
    const obj = {
      title: item.title,
      date: this.convertDate(item.release_date),
      tags: item.genre_ids,
      description: this.cutDescription(item.overview, item.genre_ids),
      rating: Number(item.vote_average.toFixed(1)),
      picture: this.getPicture(item.poster_path),
      id: item.id,
      stars: item.rating,
    };

    return obj;
  }

  convertDate(date) {
    if (date) {
      return format(new Date(date), 'MMMM dd, yyyy', { locale: enGB });
    }
  }

  cutDescription(text, genres) {
    if (text.length > 180) {
      if (genres.length < 3) {
        let cutText = text.slice(0, 160).split(' ');
        cutText.pop();
        cutText = cutText.join(' ');
        return cutText + ' ...';
      } else if (genres.length >= 5) {
        let cutText = text.slice(0, 110).split(' ');
        cutText.pop();
        cutText = cutText.join(' ');
        return cutText + ' ...';
      } else {
        let cutText = text.slice(0, 140).split(' ');
        cutText.pop();
        cutText = cutText.join(' ');
        return cutText + ' ...';
      }
    }
    return text;
  }

  getPicture(path) {
    if (path !== null && path !== undefined) {
      return `https://image.tmdb.org/t/p/original${path}`;
    }
    return noImage;
  }

  render() {
    const { props } = this.props;

    const movieItems = props.map((item) => {
      const { title, id, rating, vote_average, release_date, genre_ids, overview, poster_path } = item;

      return (
        <MovieConsumer key={`${id}_consumer`}>
          {({ genreList, movieList, sessionID }) => (
            <CardItem
              genreList={genreList}
              movieList={movieList}
              sessionID={sessionID}
              key={id + 'movie'}
              title={title}
              date={this.convertDate(release_date)}
              tags={genre_ids}
              description={this.cutDescription(overview, genre_ids)}
              rating={Number(vote_average.toFixed(1))}
              picture={this.getPicture(poster_path)}
              id={id}
              stars={rating}
            />
          )}
        </MovieConsumer>
      );
    });

    return <div className="card__container">{movieItems}</div>;
  }

  static propTypes = {
    props: PropTypes.arrayOf(PropTypes.object),
  };
}
