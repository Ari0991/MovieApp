import React, { Component } from 'react';
import PropTypes from 'prop-types';

import CardItem from '../Card-item/Card-item.js';
import './Card-list.css';
import * as prepareMovieCard from '../../utilities/utilities.js';

const { convertDate, cutDescription, getPicture } = prepareMovieCard;

export default class CardList extends Component {
  render() {
    const { props, genreList, sessionID, movieList } = this.props;

    const movieItems = props.map((item) => {
      const { title, id, rating, vote_average, release_date, genre_ids, overview, poster_path } = item;

      return (
        <CardItem
          genreList={genreList}
          movieList={movieList}
          sessionID={sessionID}
          key={id + 'movie'}
          title={title}
          date={convertDate(release_date)}
          tags={genre_ids}
          description={cutDescription(overview, genre_ids)}
          rating={Number(vote_average.toFixed(1))}
          picture={getPicture(poster_path)}
          id={id}
          stars={rating}
        />
      );
    });

    return <div className="card__container">{movieItems}</div>;
  }

  static propTypes = {
    props: PropTypes.arrayOf(PropTypes.object),
  };
}
